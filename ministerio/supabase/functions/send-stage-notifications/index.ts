// Edge Function programada por pg_cron cada 1 minuto (ver migracion 0006).
// Busca las etapas de itinerario que arrancan "ahora" y envia una
// notificacion Web Push al responsable asignado, o a todos los
// colaboradores que confirmaron asistencia al evento si no hay responsable.
//
// Se ejecuta del lado del servidor (no depende de que alguien tenga la app
// abierta) y es idempotente: cada etapa se registra en
// stage_notifications_log apenas se notifica, para no reenviar si el cron
// la vuelve a ver en la siguiente corrida.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contacto@ejemplo.org";

// Ventana de busqueda: etapas cuyo starts_at cae en el ultimo minuto y medio.
// Da margen si el cron se atrasa unos segundos, sin duplicar (el log evita
// el reenvio de una etapa ya notificada).
const WINDOW_MS = 90_000;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS).toISOString();

  const { data: dueStages, error: stagesError } = await supabase
    .from("event_stages")
    .select("id, title, starts_at, assigned_to, event_id, events!inner(id, title, status)")
    .gte("starts_at", windowStart)
    .lte("starts_at", now.toISOString())
    .eq("events.status", "programado");

  if (stagesError) {
    console.error("Error buscando etapas:", stagesError);
    return new Response(JSON.stringify({ error: stagesError.message }), { status: 500 });
  }

  if (!dueStages || dueStages.length === 0) {
    return new Response(JSON.stringify({ notified: 0 }), { status: 200 });
  }

  const stageIds = dueStages.map((s) => s.id);
  const { data: alreadySent } = await supabase
    .from("stage_notifications_log")
    .select("stage_id")
    .in("stage_id", stageIds);
  const alreadySentIds = new Set((alreadySent ?? []).map((r) => r.stage_id));

  const pendingStages = dueStages.filter((s) => !alreadySentIds.has(s.id));
  let totalNotified = 0;

  for (const stage of pendingStages) {
    const eventTitle = (stage as unknown as { events: { title: string } }).events.title;
    const recipientIds = await resolveRecipients(supabase, stage.event_id, stage.assigned_to);

    if (recipientIds.length === 0) {
      await supabase.from("stage_notifications_log").insert({ stage_id: stage.id, recipient_count: 0 });
      continue;
    }

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth_key")
      .in("user_id", recipientIds);

    const payload = JSON.stringify({
      title: `Arranca ahora: ${stage.title}`,
      body: `Etapa de "${eventTitle}" — es la hora de empezar.`,
      url: `/calendario/${stage.event_id}`,
    });

    let sentCount = 0;
    for (const sub of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          payload,
        );
        sentCount += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // La suscripcion expiro o el usuario desinstalo la PWA: la limpiamos.
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error(`Error enviando push a subscription ${sub.id}:`, err);
        }
      }
    }

    await supabase
      .from("stage_notifications_log")
      .insert({ stage_id: stage.id, recipient_count: sentCount });
    totalNotified += sentCount;
  }

  return new Response(
    JSON.stringify({ stages_processed: pendingStages.length, notifications_sent: totalNotified }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

async function resolveRecipients(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  assignedTo: string | null,
): Promise<string[]> {
  if (assignedTo) return [assignedTo];

  const { data: confirmed } = await supabase
    .from("event_rsvps")
    .select("user_id, profiles!inner(role)")
    .eq("event_id", eventId)
    .eq("status", "confirmado")
    .eq("profiles.role", "colaborador");

  if (confirmed && confirmed.length > 0) {
    return confirmed.map((r) => r.user_id as string);
  }

  // Sin responsable y sin RSVPs confirmados: se avisa a todos los
  // colaboradores activos para que nadie se pierda la etapa.
  const { data: allColaboradores } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "colaborador")
    .eq("active", true);

  return (allColaboradores ?? []).map((p) => p.id as string);
}
