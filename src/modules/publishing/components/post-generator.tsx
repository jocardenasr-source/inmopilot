"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Propiedad } from "@/modules/properties/types";
import { generarVariantes } from "../generador";

export function PostGenerator({ propiedad }: { propiedad: Propiedad }) {
  const [contacto, setContacto] = useState("");
  const [seed, setSeed] = useState(1);
  const [copiado, setCopiado] = useState<string | null>(null);

  const variantes = useMemo(
    () => generarVariantes(propiedad, contacto, seed),
    [propiedad, contacto, seed]
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

  return (
    <div className="grid gap-6">
      {/* Configuración */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
        <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
          <RefreshCw className="mr-2 size-4" />
          Generar otras versiones
        </Button>
      </div>

      {/* Recordatorio de fotos */}
      {propiedad.fotos.length > 0 && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-3 text-sm font-medium">
            📸 Recuerda adjuntar tus fotos al publicar ({propiedad.fotos.length})
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
            Facebook y los grupos requieren adjuntar las fotos manualmente (Meta
            no permite hacerlo automático en grupos). La publicación automática
            en tu Página llegará en el próximo sprint.
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
                <Button
                  variant="outline"
                  onClick={() => copiar(v.tono, v.texto)}
                >
                  {copiado === v.tono ? (
                    <>
                      <Check className="mr-2 size-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button onClick={() => copiar(v.tono, v.texto, true)}>
                  <ExternalLink className="mr-2 size-4" />
                  Copiar y abrir Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
