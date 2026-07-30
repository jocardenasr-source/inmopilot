import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { geminiConfigurado } from "@/lib/gemini";
import { obtenerPropiedad } from "@/modules/properties/queries";
import { AssistantTester } from "@/modules/ai-agent/components/assistant-tester";

export default async function AsistentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propiedad = await obtenerPropiedad(id);
  if (!propiedad) notFound();

  const geminiListo = geminiConfigurado();

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/propiedades/${id}`}>
          <ArrowLeft className="mr-1 size-4" />
          Volver a la propiedad
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold">Probar asistente IA</h1>
      <p className="mb-6 text-muted-foreground">
        Simula ser un cliente interesado en{" "}
        <strong>{propiedad.titulo}</strong>. La IA responde con los datos de la
        propiedad y avisa cuándo conviene que tú tomes el control.
      </p>

      {!geminiListo && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          La IA aún no está conectada. Falta configurar la clave gratuita de
          Gemini (siguiente paso). Mientras tanto, el chat mostrará un aviso.
        </div>
      )}

      <AssistantTester propiedad={propiedad} />
    </div>
  );
}
