import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, ImageOff, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_OPERACION,
  ETIQUETA_TIPO,
  precioConSufijo,
  type Propiedad,
} from "../types";

export function PropertyCard({ propiedad }: { propiedad: Propiedad }) {
  const portada = propiedad.fotos[0];
  const ubicacion = [propiedad.barrio, propiedad.ciudad]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/propiedades/${propiedad.id}`} className="group">
      <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {portada ? (
            <Image
              src={portada}
              alt={propiedad.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" />
            </div>
          )}
          <Badge
            className={`absolute left-2 top-2 border-0 ${COLOR_ESTADO[propiedad.estado]}`}
          >
            {ETIQUETA_ESTADO[propiedad.estado]}
          </Badge>
        </div>
        <CardContent className="grid gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{ETIQUETA_OPERACION[propiedad.operacion]}</span>
            <span>·</span>
            <span>{ETIQUETA_TIPO[propiedad.tipo]}</span>
          </div>
          <h3 className="line-clamp-1 font-semibold">{propiedad.titulo}</h3>
          <p className="text-lg font-bold text-primary">
            {precioConSufijo(propiedad.precio, propiedad.operacion)}
          </p>
          {ubicacion && (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {ubicacion}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {propiedad.habitaciones > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-4" /> {propiedad.habitaciones}
              </span>
            )}
            {propiedad.banos > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="size-4" /> {propiedad.banos}
              </span>
            )}
            {propiedad.parqueaderos > 0 && (
              <span className="flex items-center gap-1">
                <Car className="size-4" /> {propiedad.parqueaderos}
              </span>
            )}
            {propiedad.area && (
              <span className="flex items-center gap-1">
                <Maximize className="size-4" /> {propiedad.area} m²
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
