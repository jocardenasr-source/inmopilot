"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { facebookConfigurado, publicarEnPagina } from "@/lib/meta";
import { obtenerPropiedad } from "@/modules/properties/queries";

export type PublicarState = {
  ok: boolean;
  error: string | null;
  url?: string;
};

// Publica una propiedad en la Página de Facebook (texto + todas sus fotos)
// y guarda el registro en el historial.
export async function publicarEnFacebook(
  propiedadId: string,
  mensaje: string
): Promise<PublicarState> {
  if (!facebookConfigurado()) {
    return {
      ok: false,
      error:
        "Facebook aún no está conectado. Falta configurar las llaves de Meta (lo hacemos en el siguiente paso).",
    };
  }

  const texto = mensaje.trim();
  if (!texto) {
    return { ok: false, error: "El texto de la publicación está vacío." };
  }

  try {
    const propiedad = await obtenerPropiedad(propiedadId);
    if (!propiedad) {
      return { ok: false, error: "No se encontró la propiedad." };
    }

    const { postId, url } = await publicarEnPagina({
      mensaje: texto,
      fotos: propiedad.fotos,
    });

    // Guardar en el historial (si falla, no arruina la publicación).
    try {
      const supabase = await createClient();
      await supabase.from("publicaciones").insert({
        propiedad_id: propiedadId,
        red: "facebook",
        post_id: postId,
        url,
        mensaje: texto,
      });
    } catch {
      // El historial es opcional; ignoramos errores aquí.
    }

    revalidatePath(`/propiedades/${propiedadId}/publicar`);
    return { ok: true, error: null, url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo publicar.",
    };
  }
}
