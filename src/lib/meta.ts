// Integración con la API oficial de Meta (Graph API) para publicar en la
// Página de Facebook. Se usa SOLO en el servidor: el token nunca llega al
// navegador (no lleva prefijo NEXT_PUBLIC).

const VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

// ¿Están configuradas las llaves de Facebook?
export function facebookConfigurado(): boolean {
  return Boolean(
    process.env.META_PAGE_ID && process.env.META_PAGE_ACCESS_TOKEN
  );
}

type ResultadoPublicacion = { postId: string; url: string };

// Publica un post con texto y (opcionalmente) varias fotos en la Página.
// Estrategia oficial para varias fotos:
//   1) subir cada foto "sin publicar" para obtener su id
//   2) crear el post en el feed adjuntando esas fotos
export async function publicarEnPagina({
  mensaje,
  fotos,
}: {
  mensaje: string;
  fotos: string[];
}): Promise<ResultadoPublicacion> {
  const pageId = process.env.META_PAGE_ID!;
  const token = process.env.META_PAGE_ACCESS_TOKEN!;

  // 1) Subir fotos sin publicar
  const mediaFbids: string[] = [];
  for (const foto of fotos) {
    const res = await fetch(`${BASE}/${pageId}/photos`, {
      method: "POST",
      body: new URLSearchParams({
        url: foto,
        published: "false",
        access_token: token,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data?.error?.message ?? "No se pudo subir una foto a Facebook."
      );
    }
    mediaFbids.push(data.id);
  }

  // 2) Crear el post en el feed
  const params = new URLSearchParams();
  params.set("message", mensaje);
  params.set("access_token", token);
  mediaFbids.forEach((fbid, i) => {
    params.set(`attached_media[${i}]`, JSON.stringify({ media_fbid: fbid }));
  });

  const res = await fetch(`${BASE}/${pageId}/feed`, {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ?? "No se pudo publicar en Facebook."
    );
  }

  const postId = data.id as string;
  return { postId, url: `https://www.facebook.com/${postId}` };
}
