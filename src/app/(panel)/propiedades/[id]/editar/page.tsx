import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actualizarPropiedad } from "@/modules/properties/actions";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { PropertyForm } from "@/modules/properties/components/property-form";

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propiedad = await obtenerPropiedad(id);
  if (!propiedad) notFound();

  const accion = actualizarPropiedad.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/propiedades/${id}`}>
          <ArrowLeft className="mr-1 size-4" />
          Volver
        </Link>
      </Button>
      <h1 className="mb-6 text-2xl font-semibold">Editar propiedad</h1>
      <PropertyForm accion={accion} propiedad={propiedad} />
    </div>
  );
}
