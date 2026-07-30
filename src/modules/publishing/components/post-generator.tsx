"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Propiedad } from "@/modules/properties/types";
import { generarVariantes } from "../generador";
import { publicarEnFacebook } from "../actions";

export function PostGenerator({
  propiedad,
  facebookListo,
}: {
  propiedad: Propiedad;
  facebookListo: boolean;
}) {
  const [contacto, setContacto] = useState("");
  const [destacados, setDestacados] = useState("");
  const [seed, setSeed] = useState(1);
  const [copiado, setCopiado] = useState<string | null>(null);

  // Diálogo de confirmación de publicación.
  const [textoAPublicar, setTextoAPublicar] = useState<string | null>(null);
  const [publicando, startPublicar] = useTransition();

  const variantes = useMemo(
    () => generarVariantes(propiedad, { contacto, destacados, seed }),
    [propiedad, contacto, destacados, seed]
  );

  async function copiar(tono: string, texto: string, abrirFacebook = false) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tono);
      setTimeout(() => setCopiado(null), 2000);
      toast.success(
        abrirFacebook
          ? "Texto copiado. Abriendo Facebook: pega el texto y adjunta las fotos."
          : "Texto copiado. Ya puedes pegarlo donde quieras."
      );
      if (abrirFacebook) {
        window.open("https://www.facebook.com/", "_blank", "noopener");
      }
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto y cópialo a mano.");
    }
  }

  function confirmarPublicacion() {
    const texto = textoAPublicar;
    if (!texto) return;
    startPublicar(async () => {
      const res = await publicarEnFacebook(propiedad.id, texto);
      setTextoAPublicar(null);
      if (res.ok) {
        toast.success("¡Publicado en tu Página de Facebook!", {
          description: res.url,
          action: res.url
            ? {
                label: "Ver post",
                onClick: () => window.open(res.url, "_blank", "noopener"),
              }
            : undefined,
        });
      } else {
        toast.error(res.error ?? "No se pudo publicar.");
      }
    });
  }

  return (
    <div className="grid gap-6">
      {/* Configuración */}
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contacto">Tu WhatsApp o contacto (opcional)</Label>
            <Input
              id="contacto"
              placeholder="Ej: 300 123 4567"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si lo escribes, aparecerá en el anuncio para que te contacten.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destacados">Puntos destacados de la zona (opcional)</Label>
            <Input
              id="destacados"
              placeholder="Ej: cerca al Portal 20 de Julio, sobre vía principal"
              value={destacados}
              onChange={(e) => setDestacados(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sepáralos con comas. Se incluyen en el texto y se vuelven hashtags.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => setSeed((s) => s + 1)}
        >
          <RefreshCw className="mr-2 size-4" />
          Generar otras versiones
        </Button>
      </div>

      {/* Aviso si Facebook aún no está conectado */}
      {!facebookListo && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          La <strong>publicación automática en Facebook</strong> se activará
          cuando conectemos tu Página (siguiente paso). Mientras tanto, puedes
          usar <strong>&quot;Abrir FB&quot;</strong> para copiar y publicar
          manualmente.
        </div>
      )}

      {/* Recordatorio de fotos */}
      {propiedad.fotos.length > 0 && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-3 text-sm font-medium">
            📸 Fotos que se publicarán ({propiedad.fotos.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {propiedad.fotos.map((url, i) => (
              <div
                key={url}
                className="relative size-16 overflow-hidden rounded-md border"
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            En tu Página de Facebook se publican automáticamente. En grupos y
            Marketplace debes adjuntarlas a mano (Meta no permite automatizar
            grupos).
          </p>
        </div>
      )}

      {/* Variantes */}
      <div className="grid gap-4 lg:grid-cols-3">
        {variantes.map((v) => (
          <Card key={v.tono} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Tono {v.etiqueta}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <pre className="min-h-48 flex-1 whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-sans text-sm">
                {v.texto}
              </pre>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setTextoAPublicar(v.texto)}>
                  <Send className="mr-2 size-4" />
                  Publicar en Facebook
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copiar(v.tono, v.texto)}
                  >
                    {copiado === v.tono ? (
                      <>
                        <Check className="mr-1 size-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 size-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copiar(v.tono, v.texto, true)}
                  >
                    <ExternalLink className="mr-1 size-4" />
                    Abrir FB
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmación de publicación automática */}
      <Dialog
        open={textoAPublicar !== null}
        onOpenChange={(abierto) => {
          if (!abierto && !publicando) setTextoAPublicar(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Publicar en tu Página de Facebook?</DialogTitle>
            <DialogDescription>
              Se publicará este texto junto con las {propiedad.fotos.length}{" "}
              foto(s) de la propiedad en tu Página. Podrás borrarlo desde
              Facebook si lo necesitas.
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-sans text-sm">
            {textoAPublicar}
          </pre>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={publicando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={confirmarPublicacion} disabled={publicando}>
              {publicando ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Sí, publicar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
