import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { crearPropiedad } from "@/modules/properties/actions";
import { PropertyForm } from "@/modules/properties/components/property-form";

export default function NuevaPropiedadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/propiedades">
          <ArrowLeft className="mr-1 size-4" />
          Volver
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold">Nueva propiedad</h1>
      <PropertyForm accion={crearPropiedad} />
    </div>
  );
}
