"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ESTADOS,
  OPERACIONES,
  TIPOS,
  type Estado,
  type Operacion,
  type TipoInmueble,
} from "./types";

const BUCKET = "propiedades";

export type FormularioState = { error: string | null };

// Convierte un valor de formulario a número (o null si está vacío).
function aNumero(valor: FormDataEntryValue | null): number | null {
  const s = String(valor ?? "").trim();
  if (s === "") return null;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function aTexto(valor: FormDataEntryValue | null): string | null {
  const s = String(valor ?? "").trim();
  return s === "" ? null : s;
}

// Extrae la ruta interna del archivo a partir de su URL pública.
function rutaDesdeUrl(url: string): string | null {
  const marca = `/${BUCKET}/`;
  const i = url.indexOf(marca);
  return i === -1 ? null : url.slice(i + marca.length);
}

// Lee y valida los campos comunes del formulario.
function leerCampos(formData: FormData) {
  const operacion = String(formData.get("operacion")) as Operacion;
  const tipo = String(formData.get("tipo")) as TipoInmueble;
  const estado = String(formData.get("estado")) as Estado;
  const titulo = aTexto(formData.get("titulo"));

  if (!titulo) throw new Error("El título es obligatorio.");
  if (!OPERACIONES.includes(operacion)) throw new Error("Operación inválida.");
  if (!TIPOS.includes(tipo)) throw new Error("Tipo de inmueble inválido.");
  if (!ESTADOS.includes(estado)) throw new Error("Estado inválido.");

  return {
    titulo,
    operacion,
    tipo,
    estado,
    precio: aNumero(formData.get("precio")) ?? 0,
    ciudad: aTexto(formData.get("ciudad")),
    barrio: aTexto(formData.get("barrio")),
    direccion: aTexto(formData.get("direccion")),
    habitaciones: aNumero(formData.get("habitaciones")) ?? 0,
    banos: aNumero(formData.get("banos")) ?? 0,
    parqueaderos: aNumero(formData.get("parqueaderos")) ?? 0,
    area: aNumero(formData.get("area")),
    estrato: aNumero(formData.get("estrato")),
    descripcion: aTexto(formData.get("descripcion")),
  };
}

export async function crearPropiedad(
  _prev: FormularioState,
  formData: FormData
): Promise<FormularioState> {
  let nuevoId: string;
  try {
    const supabase = await createClient();
    const campos = leerCampos(formData);
    // Las fotos ya se subieron desde el navegador; aquí llegan solo las URLs.
    const fotos = formData.getAll("fotos_nuevas").map(String);

    const { data, error } = await supabase
      .from("propiedades")
      .insert({ ...campos, fotos })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    nuevoId = data.id as string;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/propiedades");
  redirect(`/propiedades/${nuevoId}`);
}

export async function actualizarPropiedad(
  id: string,
  _prev: FormularioState,
  formData: FormData
): Promise<FormularioState> {
  try {
    const supabase = await createClient();
    const campos = leerCampos(formData);

    // Fotos que el usuario conservó + las nuevas ya subidas desde el navegador.
    const conservadas = formData.getAll("fotos_actuales").map(String);
    const nuevas = formData.getAll("fotos_nuevas").map(String);

    // Borramos del Storage las fotos que se quitaron.
    const { data: previa } = await supabase
      .from("propiedades")
      .select("fotos")
      .eq("id", id)
      .single();
    const anteriores: string[] = (previa?.fotos as string[]) ?? [];
    const eliminadas = anteriores.filter((u) => !conservadas.includes(u));
    const rutasEliminadas = eliminadas
      .map(rutaDesdeUrl)
      .filter((r): r is string => r !== null);
    if (rutasEliminadas.length > 0) {
      await supabase.storage.from(BUCKET).remove(rutasEliminadas);
    }

    const { error } = await supabase
      .from("propiedades")
      .update({ ...campos, fotos: [...conservadas, ...nuevas] })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${id}`);
  redirect(`/propiedades/${id}`);
}

export async function cambiarEstado(id: string, estado: Estado) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propiedades")
    .update({ estado })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${id}`);
}

export async function borrarPropiedad(id: string) {
  const supabase = await createClient();

  // Borramos las fotos del Storage antes de borrar la fila.
  const { data } = await supabase
    .from("propiedades")
    .select("fotos")
    .eq("id", id)
    .single();
  const fotos: string[] = (data?.fotos as string[]) ?? [];
  const rutas = fotos
    .map(rutaDesdeUrl)
    .filter((r): r is string => r !== null);
  if (rutas.length > 0) {
    await supabase.storage.from(BUCKET).remove(rutas);
  }

  const { error } = await supabase.from("propiedades").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/propiedades");
  redirect("/propiedades");
}
