import { createAdminClient } from "@/lib/supabase/admin";
import { enviarWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";
import { geminiConfigurado, type MensajeChat } from "@/lib/gemini";
import { responderLeadGeneral } from "@/modules/ai-agent/agent";
import type { Propiedad } from "@/modules/properties/types";

type Entrante = {
  from: string;
  texto: string;
  nombre: string | null;
};

// Cuántos mensajes previos damos como contexto a la IA.
const CONTEXTO = 12;

// Procesa un mensaje entrante de WhatsApp: guarda, responde con IA y envía.
export async function procesarMensajeEntrante({
  from,
  texto,
  nombre,
}: Entrante): Promise<void> {
  const supabase = createAdminClient();

  // 1) Buscar o crear la conversación de este número.
  const { data: existente } = await supabase
    .from("conversaciones")
    .select("id, modo")
    .eq("telefono", from)
    .maybeSingle();

  let conversacionId: string;
  let modo: string;
  if (existente) {
    conversacionId = existente.id as string;
    modo = existente.modo as string;
    await supabase
      .from("conversaciones")
      .update({ ultimo_mensaje_at: new Date().toISOString(), nombre })
      .eq("id", conversacionId);
  } else {
    const { data: nueva, error } = await supabase
      .from("conversaciones")
      .insert({ telefono: from, nombre, modo: "ia" })
      .select("id, modo")
      .single();
    if (error || !nueva) return;
    conversacionId = nueva.id as string;
    modo = "ia";
  }

  // 2) Guardar el mensaje entrante.
  await supabase.from("mensajes").insert({
    conversacion_id: conversacionId,
    direccion: "entrante",
    texto,
  });

  // 3) Si Omar tomó el control (modo humano), no respondemos con IA.
  if (modo === "humano") return;

  // Si falta configuración, no podemos responder automáticamente.
  if (!geminiConfigurado() || !whatsappConfigurado()) return;

  // 4) Cargar propiedades disponibles y el historial reciente.
  const { data: props } = await supabase
    .from("propiedades")
    .select("*")
    .eq("estado", "disponible")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: previos } = await supabase
    .from("mensajes")
    .select("direccion, texto")
    .eq("conversacion_id", conversacionId)
    .order("created_at", { ascending: false })
    .limit(CONTEXTO + 1);

  // El más reciente es el que acabamos de guardar; lo quitamos del historial.
  const historial: MensajeChat[] = (previos ?? [])
    .slice(1)
    .reverse()
    .map((m) => ({
      role: m.direccion === "entrante" ? "user" : "model",
      text: m.texto as string,
    }));

  // 5) Generar la respuesta con IA.
  let respuesta = "";
  let intencion = "otro";
  let escalar = false;
  try {
    const r = await responderLeadGeneral(
      (props ?? []) as Propiedad[],
      historial,
      texto
    );
    respuesta = r.respuesta;
    intencion = r.intencion;
    escalar = r.escalar;
  } catch {
    return; // Si la IA falla, no enviamos nada (evita spam de errores).
  }
  if (!respuesta) return;

  // 6) Enviar la respuesta por WhatsApp.
  try {
    await enviarWhatsApp(from, respuesta);
  } catch {
    return;
  }

  // 7) Guardar la respuesta y actualizar la conversación.
  await supabase.from("mensajes").insert({
    conversacion_id: conversacionId,
    direccion: "saliente",
    texto: respuesta,
    intencion,
    escalar,
  });

  // Si la IA detectó intención de cierre, pasamos a modo humano
  // para que Omar continúe la conversación.
  if (escalar) {
    await supabase
      .from("conversaciones")
      .update({ modo: "humano" })
      .eq("id", conversacionId);
  }
}
