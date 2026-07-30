"use server";

import { geminiConfigurado, type MensajeChat } from "@/lib/gemini";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { responderLead, type Intencion } from "./agent";

export type AsistenteState = {
  ok: boolean;
  error: string | null;
  respuesta?: string;
  intencion?: Intencion;
  escalar?: boolean;
};

// Server action para el chat de prueba: recibe el historial y el mensaje del
// "cliente" y devuelve la respuesta de la IA usando los datos de la propiedad.
export async function probarAsistente(
  propiedadId: string,
  historial: MensajeChat[],
  mensaje: string
): Promise<AsistenteState> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      error:
        "La IA (Gemini) aún no está conectada. Falta configurar la clave gratuita de Google (siguiente paso).",
    };
  }

  const texto = mensaje.trim();
  if (!texto) return { ok: false, error: "Escribe un mensaje." };

  try {
    const propiedad = await obtenerPropiedad(propiedadId);
    if (!propiedad) return { ok: false, error: "No se encontró la propiedad." };

    const r = await responderLead(propiedad, historial, texto);
    return {
      ok: true,
      error: null,
      respuesta: r.respuesta,
      intencion: r.intencion,
      escalar: r.escalar,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo responder.",
    };
  }
}
