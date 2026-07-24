"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Home,
  Megaphone,
  MessageCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

type Modulo = {
  nombre: string;
  icono: LucideIcon;
  href: string;
  disponible: boolean;
};

const modulos: Modulo[] = [
  { nombre: "Inicio", icono: Home, href: "/", disponible: true },
  {
    nombre: "Propiedades",
    icono: Building2,
    href: "/propiedades",
    disponible: true,
  },
  {
    nombre: "Publicaciones",
    icono: Megaphone,
    href: "#",
    disponible: false,
  },
  { nombre: "WhatsApp", icono: MessageCircle, href: "#", disponible: false },
  { nombre: "CRM de leads", icono: Users, href: "#", disponible: false },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {modulos.map(({ nombre, icono: Icono, href, disponible }) => {
        const activo =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        if (!disponible) {
          return (
            <span
              key={nombre}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              <Icono className="size-4" />
              {nombre}
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px]">
                Pronto
              </span>
            </span>
          );
        }

        return (
          <Link
            key={nombre}
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              activo
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Icono className="size-4" />
            {nombre}
          </Link>
        );
      })}
    </nav>
  );
}
