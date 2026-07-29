"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESTADOS,
  ESTRATOS,
  ETIQUETA_ESTADO,
  ETIQUETA_OPERACION,
  ETIQUETA_TIPO,
  OPERACIONES,
  TIPOS,
  type Propiedad,
} from "../types";
import type { FormularioState } from "../actions";

type Accion = (
  prev: FormularioState,
  formData: FormData
) => Promise<FormularioState>;

const inicial: FormularioState = { error: null };

export function PropertyForm({
  accion,
  propiedad,
}: {
  accion: Accion;
  propiedad?: Propiedad;
}) {
  const [state, formAction, pending] = useActionState(accion, inicial);
  const editando = Boolean(propiedad);

  // Fotos que ya existen (solo en edición) y que el usuario puede quitar.
  const [fotosActuales, setFotosActuales] = useState<string[]>(
    propiedad?.fotos ?? []
  );
  // Fotos nuevas ya subidas a Supabase (guardamos sus URLs públicas).
  const [nuevasUrls, setNuevasUrls] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const inputFotos = useRef<HTMLInputElement>(null);

  async function onSeleccionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setErrorFoto(null);
    setSubiendo(true);
    const supabase = createClient();

    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const ruta = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("propiedades")
          .upload(ruta, file, { contentType: file.type || undefined });
        if (error) throw error;
        const { data } = supabase.storage
          .from("propiedades")
          .getPublicUrl(ruta);
        setNuevasUrls((prev) => [...prev, data.publicUrl]);
      }
    } catch {
      setErrorFoto(
        "No se pudo subir alguna foto. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setSubiendo(false);
      if (inputFotos.current) inputFotos.current.value = "";
    }
  }

  return (
    <form action={formAction} className="grid gap-6">
      {/* Datos principales */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            name="titulo"
            required
            placeholder="Ej: Apartamento amplio con balcón en Laureles"
            defaultValue={propiedad?.titulo}
          />
        </div>

        <div className="grid gap-2">
          <Label>Operación *</Label>
          <Select name="operacion" defaultValue={propiedad?.operacion ?? "arriendo"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERACIONES.map((o) => (
                <SelectItem key={o} value={o}>
                  {ETIQUETA_OPERACION[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Tipo de inmueble *</Label>
          <Select name="tipo" defaultValue={propiedad?.tipo ?? "apartamento"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {ETIQUETA_TIPO[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="precio">Precio (COP) *</Label>
          <Input
            id="precio"
            name="precio"
            type="number"
            min="0"
            required
            placeholder="1500000"
            defaultValue={propiedad?.precio}
          />
        </div>

        <div className="grid gap-2">
          <Label>Estado *</Label>
          <Select name="estado" defaultValue={propiedad?.estado ?? "disponible"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Ubicación */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" name="ciudad" defaultValue={propiedad?.ciudad ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="barrio">Barrio</Label>
          <Input id="barrio" name="barrio" defaultValue={propiedad?.barrio ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            name="direccion"
            defaultValue={propiedad?.direccion ?? ""}
          />
        </div>
      </section>

      {/* Características */}
      <section className="grid gap-4 sm:grid-cols-5">
        <div className="grid gap-2">
          <Label htmlFor="habitaciones">Habitaciones</Label>
          <Input
            id="habitaciones"
            name="habitaciones"
            type="number"
            min="0"
            defaultValue={propiedad?.habitaciones ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="banos">Baños</Label>
          <Input
            id="banos"
            name="banos"
            type="number"
            min="0"
            defaultValue={propiedad?.banos ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parqueaderos">Parqueaderos</Label>
          <Input
            id="parqueaderos"
            name="parqueaderos"
            type="number"
            min="0"
            defaultValue={propiedad?.parqueaderos ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            name="area"
            type="number"
            min="0"
            step="0.01"
            defaultValue={propiedad?.area ?? ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>Estrato</Label>
          <Select
            name="estrato"
            defaultValue={propiedad?.estrato ? String(propiedad.estrato) : undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {ESTRATOS.map((e) => (
                <SelectItem key={e} value={String(e)}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Descripción */}
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          placeholder="Describe la propiedad: acabados, cercanías, servicios incluidos, etc."
          defaultValue={propiedad?.descripcion ?? ""}
        />
      </div>

      {/* Fotos existentes (edición) */}
      {editando && fotosActuales.length > 0 && (
        <div className="grid gap-2">
          <Label>Fotos actuales</Label>
          <div className="flex flex-wrap gap-3">
            {fotosActuales.map((url) => (
              <div key={url} className="relative size-24 overflow-hidden rounded-md border">
                <Image src={url} alt="Foto" fill className="object-cover" sizes="96px" />
                <input type="hidden" name="fotos_actuales" value={url} />
                <button
                  type="button"
                  onClick={() =>
                    setFotosActuales((prev) => prev.filter((u) => u !== url))
                  }
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label="Quitar foto"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subir fotos nuevas (se suben directo a Supabase al seleccionarlas) */}
      <div className="grid gap-2">
        <Label>{editando ? "Agregar más fotos" : "Fotos"}</Label>
        <input
          ref={inputFotos}
          type="file"
          accept="image/*"
          multiple
          onChange={onSeleccionarFotos}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => inputFotos.current?.click()}
          disabled={subiendo}
        >
          {subiendo ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Subiendo fotos...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 size-4" />
              Seleccionar fotos
            </>
          )}
        </Button>
        {errorFoto && (
          <p className="text-sm text-destructive" role="alert">
            {errorFoto}
          </p>
        )}
        {nuevasUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {nuevasUrls.map((url) => (
              <div
                key={url}
                className="relative size-24 overflow-hidden rounded-md border"
              >
                <Image
                  src={url}
                  alt="Foto nueva"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <input type="hidden" name="fotos_nuevas" value={url} />
                <button
                  type="button"
                  onClick={() =>
                    setNuevasUrls((prev) => prev.filter((u) => u !== url))
                  }
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label="Quitar foto"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || subiendo}>
          {pending ? "Guardando..." : editando ? "Guardar cambios" : "Crear propiedad"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href={propiedad ? `/propiedades/${propiedad.id}` : "/propiedades"}>
            Cancelar
          </Link>
        </Button>
      </div>
    </form>
  );
}
