import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  ImageOff,
  Layers,
  MapPin,
  Maximize,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { PropertyActions } from "@/modules/properties/components/property-actions";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_OPERACION,
  ETIQUETA_TIPO,
  precioConSufijo,
} from "@/modules/properties/types";

export default async function DetallePropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await obtenerPropiedad(id);
  if (!p) notFound();

  const ubicacion = [p.direccion, p.barrio, p.ciudad].filter(Boolean).join(", ");

  const caracteristicas = [
    p.habitaciones > 0 && {
      icono: BedDouble,
      etiqueta: "Habitaciones",
      valor: p.habitaciones,
    },
    p.banos > 0 && { icono: Bath, etiqueta: "Baños", valor: p.banos },
    p.parqueaderos > 0 && {
      icono: Car,
      etiqueta: "Parqueaderos",
      valor: p.parqueaderos,
    },
    p.area && { icono: Maximize, etiqueta: "Área", valor: `${p.area} m²` },
    p.estrato && { icono: Layers, etiqueta: "Estrato", valor: p.estrato },
  ].filter(Boolean) as {
    icono: typeof BedDouble;
    etiqueta: string;
    valor: string | number;
  }[];

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/propiedades">
          <ArrowLeft className="mr-1 size-4" />
          Volver al catálogo
        </Link>
      </Button>

      {/* Galería de fotos */}
      {p.fotos.length > 0 ? (
        <div className="mb-6 grid gap-3">
          <div className="relative aspect-video max-h-[70vh] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={p.fotos[0]}
              alt={p.titulo}
              fill
              className="object-contain"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
          {p.fotos.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {p.fotos.slice(1).map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={url}
                    alt={p.titulo}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground">
          <ImageOff className="size-8" />
        </div>
      )}

      {/* Encabezado */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{ETIQUETA_OPERACION[p.operacion]}</span>
            <span>·</span>
            <span>{ETIQUETA_TIPO[p.tipo]}</span>
            <Badge className={`border-0 ${COLOR_ESTADO[p.estado]}`}>
              {ETIQUETA_ESTADO[p.estado]}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold">{p.titulo}</h1>
          {ubicacion && (
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-4" />
              {ubicacion}
            </p>
          )}
        </div>
        <p className="text-2xl font-bold text-primary">
          {precioConSufijo(p.precio, p.operacion)}
        </p>
      </div>

      <div className="mb-6">
        <PropertyActions id={p.id} estado={p.estado} />
      </div>

      {/* Características */}
      {caracteristicas.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {caracteristicas.map(({ icono: Icono, etiqueta, valor }) => (
            <div
              key={etiqueta}
              className="flex flex-col items-center rounded-lg border p-3 text-center"
            >
              <Icono className="mb-1 size-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{valor}</span>
              <span className="text-xs text-muted-foreground">{etiqueta}</span>
            </div>
          ))}
        </div>
      )}

      {/* Descripción */}
      {p.descripcion && (
        <div>
          <h2 className="mb-2 font-semibold">Descripción</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {p.descripcion}
          </p>
        </div>
      )}
    </div>
  );
}
