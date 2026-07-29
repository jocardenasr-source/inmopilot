"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
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

  // Todas las fotos, en orden. La primera (índice 0) es la portada/principal.
  const [fotos, setFotos] = useState<string[]>(propiedad?.fotos ?? []);
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
        setFotos((prev) => [...prev, data.publicUrl]);
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

  function hacerPrincipal(url: string) {
    setFotos((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  function quitarFoto(url: string) {
    setFotos((prev) => prev.filter((u) => u !== url));
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

      {/* Fotos: se suben directo a Supabase al seleccionarlas.
          La primera es la portada; se puede cambiar con la estrella. */}
      <div className="grid gap-2">
        <Label>Fotos</Label>
        {fotos.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Pasa el cursor sobre una foto y toca la estrella ⭐ para usarla como
            portada.
          </p>
        )}
        <input
          ref={inputFotos}
          type="file"
          accept="image/*"
          multiple
          onChange={onSeleccionarFotos}
          className="hidden"
        />

        {fotos.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-3">
            {fotos.map((url, i) => (
              <div
                key={url}
                className="group relative size-28 overflow-hidden rounded-md border"
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                <input type="hidden" name="fotos_urls" value={url} />

                {/* Distintivo de portada en la primera foto */}
                {i === 0 && (
                  <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    <Star className="size-3 fill-current" />
                    Portada
                  </span>
                )}

                {/* Botón quitar */}
                <button
                  type="button"
                  onClick={() => quitarFoto(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label="Quitar foto"
                >
                  <X className="size-3" />
                </button>

                {/* Botón hacer portada (solo si no es la primera) */}
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => hacerPrincipal(url)}
                    className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 text-[11px] text-white opacity-0 transition-opacity hover:bg-black/75 group-hover:opacity-100"
                  >
                    <Star className="size-3" />
                    Hacer portada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mt-1 w-fit"
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
              {fotos.length > 0 ? "Agregar más fotos" : "Seleccionar fotos"}
            </>
          )}
        </Button>
        {errorFoto && (
          <p className="text-sm text-destructive" role="alert">
            {errorFoto}
          </p>
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
