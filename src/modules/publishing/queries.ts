import { createClient } from "@/lib/supabase/server";

export type Publicacion = {
  id: string;
  propiedad_id: string;
  red: string;
  post_id: string | null;
  url: string | null;
  mensaje: string | null;
  estado: string;
  created_at: string;
};

// Historial de publicaciones de una propiedad (más recientes primero).
// Si la tabla aún no existe, devuelve lista vacía en vez de romper.
export async function listarPublicaciones(
  propiedadId: string
): Promise<Publicacion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publicaciones")
    .select("*")
    .eq("propiedad_id", propiedadId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Publicacion[];
}
