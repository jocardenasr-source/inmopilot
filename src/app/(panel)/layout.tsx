import { redirect } from "next/navigation";
import {
  Building2,
  Home,
  Megaphone,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const modulos = [
  { nombre: "Inicio", icono: Home, disponible: true },
  { nombre: "Propiedades", icono: Building2, disponible: false },
  { nombre: "Publicaciones", icono: Megaphone, disponible: false },
  { nombre: "WhatsApp", icono: MessageCircle, disponible: false },
  { nombre: "CRM de leads", icono: Users, disponible: false },
];

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-muted/30 p-4 sm:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <span className="text-lg font-semibold">InmoPilot</span>
        </div>
        <nav className="grid gap-1">
          {modulos.map(({ nombre, icono: Icono, disponible }) => (
            <span
              key={nombre}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                disponible
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icono className="size-4" />
              {nombre}
              {!disponible && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px]">
                  Pronto
                </span>
              )}
            </span>
          ))}
        </nav>
        <form action={logout} className="mt-auto">
          <Button type="submit" variant="outline" className="w-full">
            Cerrar sesión
          </Button>
        </form>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:hidden">
          <span className="font-semibold">InmoPilot</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
