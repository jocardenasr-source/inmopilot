"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { borrarPropiedad, cambiarEstado } from "../actions";
import { ESTADOS, ETIQUETA_ESTADO, type Estado } from "../types";

export function PropertyActions({
  id,
  estado,
}: {
  id: string;
  estado: Estado;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [borrando, setBorrando] = useState(false);

  function onCambiarEstado(nuevo: Estado) {
    if (nuevo === estado) return;
    startTransition(async () => {
      await cambiarEstado(id, nuevo);
      router.refresh();
    });
  }

  function onBorrar() {
    setBorrando(true);
    startTransition(async () => {
      await borrarPropiedad(id);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={pending}>
            Estado: {ETIQUETA_ESTADO[estado]}
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {ESTADOS.map((e) => (
            <DropdownMenuItem key={e} onSelect={() => onCambiarEstado(e)}>
              {ETIQUETA_ESTADO[e]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" asChild>
        <Link href={`/propiedades/${id}/editar`}>
          <Pencil className="mr-1 size-4" />
          Editar
        </Link>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-destructive">
            <Trash2 className="mr-1 size-4" />
            Borrar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Borrar esta propiedad?</DialogTitle>
            <DialogDescription>
              Se eliminará la propiedad y todas sus fotos. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onBorrar}
              disabled={borrando}
            >
              {borrando ? "Borrando..." : "Sí, borrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
