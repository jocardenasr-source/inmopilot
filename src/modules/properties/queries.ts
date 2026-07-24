import { createClient } from "@/lib/supabase/server";
import type { Propiedad } from "./types";

// Trae todas las propiedades, más recientes primero.
export async function listarPropiedades(): Promise<Propiedad[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las propiedades: ${error.message}`);
  }
  return (data ?? []) as Propiedad[];
}

// Trae una propiedad por su id. Devuelve null si no existe.
export async function obtenerPropiedad(id: string): Promise<Propiedad | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la propiedad: ${error.message}`);
  }
  return (data as Propiedad) ?? null;
}
