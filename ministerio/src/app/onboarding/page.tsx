"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AppleIcon, BellIcon, CheckIcon } from "@/components/ui/icons";
import { isIosBrowserTab, isPushSupported, subscribeToPush } from "@/lib/push";

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <Onboarding />
    </Suspense>
  );
}

function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [isIos, setIsIos] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushStatus, setPushStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    setIsIos(isIosBrowserTab());
    setPushSupported(isPushSupported());
  }, []);

  function continueToApp() {
    try {
      window.localStorage.setItem("onboarding_visto", "1");
    } catch {
      // localStorage puede fallar en navegacion privada; no bloquea el flujo.
    }
    router.replace(next);
  }

  async function handleEnableNotifications() {
    setPushStatus("loading");
    const result = await subscribeToPush();
    if (result.ok) {
      setPushStatus("ok");
    } else {
      setPushStatus("error");
      setPushError(reasonToMessage(result.reason));
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bienvenido/a al equipo</CardTitle>
          <CardDescription>
            Un ultimo paso para no perderte los avisos del itinerario de cada evento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIos ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 font-medium">
                <AppleIcon className="h-5 w-5" /> Estas usando Safari en iPhone
              </div>
              <p className="text-sm text-muted-foreground">
                En iPhone, las notificaciones push <strong>no llegan</strong> si abris la app solo desde una
                pestana del navegador. Para recibir el aviso apenas empieza cada etapa del evento, agrega la
                app a tu pantalla de inicio:
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                <li>
                  Toca el boton <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en la
                  barra de Safari.
                </li>
                <li>
                  Elegi <strong>&quot;Agregar a inicio&quot;</strong> (&quot;Add to Home Screen&quot;).
                </li>
                <li>Confirma tocando &quot;Agregar&quot; arriba a la derecha.</li>
                <li>
                  Cerra esta pestana y abri la app <strong>desde el icono</strong> que aparecio en tu
                  pantalla de inicio.
                </li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Una vez que la abras desde el icono, volve a esta pantalla para activar las notificaciones.
              </p>
            </div>
          ) : pushSupported ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 font-medium">
                <BellIcon className="h-5 w-5" /> Activa las notificaciones
              </div>
              <p className="text-sm text-muted-foreground">
                Te avisamos apenas empieza cada etapa de un evento (merienda, juegos, predica, etc.) si sos
                el responsable o si confirmaste tu asistencia.
              </p>
              {pushStatus === "ok" ? (
                <Alert className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" /> Notificaciones activadas.
                </Alert>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleEnableNotifications}
                  disabled={pushStatus === "loading"}
                >
                  {pushStatus === "loading" ? "Activando..." : "Activar notificaciones"}
                </Button>
              )}
              {pushStatus === "error" && <Alert variant="warning">{pushError}</Alert>}
            </div>
          ) : (
            <Alert variant="warning">
              Este navegador no soporta notificaciones push. Igual podes usar toda la app normalmente.
            </Alert>
          )}

          <Button type="button" className="w-full" onClick={continueToApp}>
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function reasonToMessage(reason?: string) {
  switch (reason) {
    case "permiso_denegado":
      return "Bloqueaste las notificaciones. Podes activarlas despues desde los ajustes del navegador.";
    case "ios_sin_instalar":
      return "Primero agrega la app a tu pantalla de inicio desde Safari.";
    case "vapid_no_configurado":
      return "Las notificaciones todavia no estan configuradas por el equipo tecnico.";
    default:
      return "No pudimos activar las notificaciones en este dispositivo.";
  }
}
