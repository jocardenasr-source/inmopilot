import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { facebookConfigurado } from "@/lib/meta";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { listarPublicaciones } from "@/modules/publishing/queries";
import { PostGenerator } from "@/modules/publishing/components/post-generator";

function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function PublicarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propiedad = await obtenerPropiedad(id);
  if (!propiedad) notFound();

  const facebookListo = facebookConfigurado();
  const historial = await listarPublicaciones(id);

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
        Elige el tono que más te guste y publícalo en tu Página de Facebook, o
        cópialo para pegarlo en grupos y otras redes.
      </p>

      <PostGenerator propiedad={propiedad} facebookListo={facebookListo} />

      {/* Historial de publicaciones */}
      {historial.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Historial de publicaciones</h2>
          <ul className="grid gap-2">
            {historial.map((pub) => (
              <li
                key={pub.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <span>
                  Publicado en{" "}
                  <span className="capitalize">{pub.red}</span> ·{" "}
                  {fechaLegible(pub.created_at)}
                </span>
                {pub.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={pub.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 size-4" />
                      Ver post
                    </a>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
