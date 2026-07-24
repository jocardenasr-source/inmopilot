import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">
        Hola, Omar 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        Sesión iniciada como {user?.email}. Este es tu panel de InmoPilot.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/propiedades">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">🏠 Propiedades</CardTitle>
              <CardDescription>
                Registra y administra tus propiedades con fotos, precio y
                estado. ¡Ya disponible!
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📣 Publicaciones</CardTitle>
            <CardDescription>
              La IA redactará posts atractivos y los publicará en tu Página de
              Facebook. Sprints 2 y 3.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💬 WhatsApp</CardTitle>
            <CardDescription>
              Respuestas automáticas y humanizadas a tus interesados. Sprint 4.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">👥 CRM de leads</CardTitle>
            <CardDescription>
              Bandeja de chats y seguimiento de cada interesado hasta el
              cierre. Sprint 5.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
