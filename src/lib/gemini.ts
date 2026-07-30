// Cliente para la API de Google Gemini (plan gratuito de Google AI Studio).
// Se usa SOLO en el servidor: la clave nunca llega al navegador.

const MODELO = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type MensajeChat = {
  // "user" = el cliente/lead; "model" = el asistente.
  role: "user" | "model";
  text: string;
};

// ¿Está configurada la clave de Gemini?
export function geminiConfigurado(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Llama a Gemini y devuelve el texto de la respuesta.
// Si `json` es true, pide que la respuesta sea un JSON.
export async function generarContenido({
  system,
  mensajes,
  json = false,
}: {
  system?: string;
  mensajes: MensajeChat[];
  json?: boolean;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY!;

  const body: Record<string, unknown> = {
    contents: mensajes.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }
  if (json) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(
    `${BASE}/models/${MODELO}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ?? "No se pudo generar la respuesta con Gemini."
    );
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
