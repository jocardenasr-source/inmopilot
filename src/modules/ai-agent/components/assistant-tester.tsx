"use client";

import { useRef, useState, useTransition } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Propiedad } from "@/modules/properties/types";
import { probarAsistente, type AsistenteState } from "../actions";

type Turno = {
  role: "user" | "model";
  text: string;
  intencion?: string;
  escalar?: boolean;
};

const ETIQUETA_INTENCION: Record<string, string> = {
  saludo: "Saludo",
  consulta: "Consulta",
  visita: "Quiere visita",
  precio: "Habla de precio",
  otro: "Otro",
};

export function AssistantTester({ propiedad }: { propiedad: Propiedad }) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const [pending, startTransition] = useTransition();
  const finRef = useRef<HTMLDivElement>(null);

  function enviar() {
    const mensaje = texto.trim();
    if (!mensaje || pending) return;

    const historial = turnos.map((t) => ({ role: t.role, text: t.text }));
    setTurnos((prev) => [...prev, { role: "user", text: mensaje }]);
    setTexto("");

    startTransition(async () => {
      const res: AsistenteState = await probarAsistente(
        propiedad.id,
        historial,
        mensaje
      );
      if (res.ok) {
        setTurnos((prev) => [
          ...prev,
          {
            role: "model",
            text: res.respuesta ?? "",
            intencion: res.intencion,
            escalar: res.escalar,
          },
        ]);
      } else {
        setTurnos((prev) => [
          ...prev,
          { role: "model", text: `⚠️ ${res.error}` },
        ]);
      }
      requestAnimationFrame(() =>
        finRef.current?.scrollIntoView({ behavior: "smooth" })
      );
    });
  }

  return (
    <div className="grid gap-4">
      <div className="min-h-72 rounded-lg border bg-muted/20 p-4">
        {turnos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Escribe abajo como si fueras un cliente interesado (ej: “Hola, ¿esta
            propiedad todavía está disponible?”) y mira cómo responde la IA.
          </p>
        ) : (
          <div className="grid gap-3">
            {turnos.map((t, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  t.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {t.role === "model" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    t.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border"
                  }`}
                >
                  <p className="whitespace-pre-line">{t.text}</p>
                  {t.role === "model" && (t.intencion || t.escalar) && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {t.intencion && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {ETIQUETA_INTENCION[t.intencion] ?? t.intencion}
                        </span>
                      )}
                      {t.escalar && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          🙋 Pasar a un humano
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {t.role === "user" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}
            {pending && (
              <div className="flex gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Escribiendo…
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Escribe un mensaje como cliente…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !texto.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
