"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { BellIcon } from "@/components/ui/icons";
import { isIosBrowserTab, isPushSupported, subscribeToPush } from "@/lib/push";

export function NotificationSettings() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (isIosBrowserTab()) {
      setStatus("error");
      setMessage("Primero agrega la app a tu pantalla de inicio desde Safari (boton Compartir → Agregar a inicio).");
      return;
    }
    if (!isPushSupported()) {
      setStatus("error");
      setMessage("Este navegador no soporta notificaciones push.");
      return;
    }
    setStatus("loading");
    const result = await subscribeToPush();
    if (result.ok) {
      setStatus("ok");
      setMessage("Notificaciones activadas en este dispositivo.");
    } else {
      setStatus("error");
      setMessage("No pudimos activar las notificaciones. Revisa los permisos del navegador.");
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 font-medium">
        <BellIcon className="h-5 w-5" /> Notificaciones de etapas
      </div>
      <p className="text-sm text-muted-foreground">
        Recibi un aviso apenas empieza cada etapa del itinerario de un evento.
      </p>
      <Button type="button" variant="outline" className="w-full" onClick={handleClick} disabled={status === "loading"}>
        {status === "loading" ? "Activando..." : "Activar en este dispositivo"}
      </Button>
      {message && <Alert variant={status === "error" ? "warning" : "default"}>{message}</Alert>}
    </div>
  );
}
