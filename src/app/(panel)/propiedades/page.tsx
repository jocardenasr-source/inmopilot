import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listarPropiedades } from "@/modules/properties/queries";
import { PropertyCard } from "@/modules/properties/components/property-card";

export default async function PropiedadesPage() {
  const propiedades = await listarPropiedades();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Propiedades</h1>
          <p className="text-muted-foreground">
            {propiedades.length === 0
              ? "Aún no tienes propiedades registradas."
              : `${propiedades.length} ${
                  propiedades.length === 1 ? "propiedad" : "propiedades"
                } en tu catálogo.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/propiedades/nueva">
            <Plus className="mr-2 size-4" />
            Nueva propiedad
          </Link>
        </Button>
      </div>

      {propiedades.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="size-6 text-muted-foreground" />
          </div>
          <p className="mb-1 font-medium">Empieza tu catálogo</p>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Registra tu primera propiedad con fotos, precio y ubicación para
            tenerla lista y publicarla después.
          </p>
          <Button asChild>
            <Link href="/propiedades/nueva">
              <Plus className="mr-2 size-4" />
              Agregar la primera
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((p) => (
            <PropertyCard key={p.id} propiedad={p} />
          ))}
        </div>
      )}
    </div>
  );
}
