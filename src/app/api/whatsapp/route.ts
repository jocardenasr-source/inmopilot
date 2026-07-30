import { procesarMensajeEntrante } from "@/modules/whatsapp/handler";

// Verificación del webhook (Meta llama con GET al configurarlo).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Mensajes entrantes de WhatsApp (Meta llama con POST).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const mensaje = value?.messages?.[0];

    // Solo procesamos mensajes de texto (ignoramos estados de entrega, etc.).
    if (mensaje && mensaje.type === "text") {
      await procesarMensajeEntrante({
        from: mensaje.from,
        texto: mensaje.text?.body ?? "",
        nombre: value?.contacts?.[0]?.profile?.name ?? null,
      });
    }
  } catch {
    // No lanzamos error para que Meta no reintente en bucle.
  }

  // Siempre respondemos 200 para confirmar la recepción.
  return new Response("ok", { status: 200 });
}
