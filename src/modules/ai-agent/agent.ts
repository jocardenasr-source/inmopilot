import { generarContenido, type MensajeChat } from "@/lib/gemini";
import type { Propiedad } from "@/modules/properties/types";
import { promptSistema } from "./prompts";
import { promptSistemaGeneral } from "./prompts-general";

export type Intencion = "saludo" | "consulta" | "visita" | "precio" | "otro";

export type RespuestaAgente = {
  respuesta: string;
  intencion: Intencion;
  escalar: boolean;
};

// Genera la respuesta humanizada de la IA para un mensaje de un lead,
// usando los datos reales de la propiedad y el historial de la conversación.
export async function responderLead(
  propiedad: Propiedad,
  historial: MensajeChat[],
  mensaje: string
): Promise<RespuestaAgente> {
  const mensajes: MensajeChat[] = [
    ...historial,
    { role: "user", text: mensaje },
  ];

  const texto = await generarContenido({
    system: promptSistema(propiedad),
    mensajes,
    json: true,
  });

  return interpretar(texto);
}

// Igual que responderLead, pero sobre TODAS las propiedades disponibles
// (para WhatsApp, donde no se sabe de antemano cuál pregunta el cliente).
export async function responderLeadGeneral(
  propiedades: Propiedad[],
  historial: MensajeChat[],
  mensaje: string
): Promise<RespuestaAgente> {
  const mensajes: MensajeChat[] = [
    ...historial,
    { role: "user", text: mensaje },
  ];

  const texto = await generarContenido({
    system: promptSistemaGeneral(propiedades),
    mensajes,
    json: true,
  });

  return interpretar(texto);
}

// Convierte la respuesta (idealmente JSON) de la IA en un objeto tipado.
function interpretar(texto: string): RespuestaAgente {
  try {
    const j = JSON.parse(texto);
    const intenciones: Intencion[] = [
      "saludo",
      "consulta",
      "visita",
      "precio",
      "otro",
    ];
    const intencion: Intencion = intenciones.includes(j.intencion)
      ? j.intencion
      : "otro";
    return {
      respuesta: String(j.respuesta ?? "").trim(),
      intencion,
      escalar: Boolean(j.escalar),
    };
  } catch {
    // Si la IA no devolvió JSON válido, usamos el texto tal cual.
    return { respuesta: texto.trim(), intencion: "otro", escalar: false };
  }
}
