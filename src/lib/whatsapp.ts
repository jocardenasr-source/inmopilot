// Envío de mensajes por WhatsApp Cloud API (oficial de Meta).
// Solo servidor: los tokens nunca llegan al navegador.

const VERSION = process.env.META_GRAPH_VERSION || "v25.0";

export function whatsappConfigurado(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

// Envía un mensaje de texto a un número (formato internacional, ej: 57300...).
export async function enviarWhatsApp(to: string, texto: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_ACCESS_TOKEN!;

  const res = await fetch(
    `https://graph.facebook.com/${VERSION}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: texto },
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error?.message ?? "No se pudo enviar el mensaje de WhatsApp."
    );
  }
}
