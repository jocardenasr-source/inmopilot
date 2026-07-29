import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { PostGenerator } from "@/modules/publishing/components/post-generator";

export default async function PublicarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propiedad = await obtenerPropiedad(id);
  if (!propiedad) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/propiedades/${id}`}>
          <ArrowLeft className="mr-1 size-4" />
          Volver a la propiedad
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold">Generar publicación</h1>
      <p className="mb-6 text-muted-foreground">
        Elige el tono que más te guste, cópialo y publícalo en Facebook o donde
        quieras. Puedes generar otras versiones las veces que necesites.
      </p>
      <PostGenerator propiedad={propiedad} />
    </div>
  );
}
