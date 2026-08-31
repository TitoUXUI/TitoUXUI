import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/utils";
import type { EventRow, EventType } from "@/lib/types/database.types";

const TYPE_LABELS: Record<EventType, string> = {
  reunion: "Reunion",
  campamento: "Campamento",
  evento: "Evento",
};

export default async function CalendarioPage() {
  const { profile } = await requireUser();
  const supabase = createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_at", { ascending: true })
    .returns<EventRow[]>();

  const now = new Date();
  const proximos = (events ?? []).filter((e) => new Date(e.start_at) >= now);
  const pasados = (events ?? []).filter((e) => new Date(e.start_at) < now).reverse();

  return (
    <>
      <TopBar
        title="Calendario"
        role={profile.role}
        action={
          profile.role === "lider" && (
            <ButtonLink href="/calendario/nuevo" size="icon" aria-label="Nuevo evento">
              <PlusIcon className="h-5 w-5" />
            </ButtonLink>
          )
        }
      />
      <main className="flex-1 space-y-6 p-4">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Proximos</h2>
          {proximos.length > 0 ? (
            proximos.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <EmptyState title="No hay eventos proximos" />
          )}
        </section>

        {pasados.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Pasados</h2>
            {pasados.slice(0, 10).map((event) => (
              <EventCard key={event.id} event={event} muted />
            ))}
          </section>
        )}
      </main>
    </>
  );
}

function EventCard({ event, muted }: { event: EventRow; muted?: boolean }) {
  return (
    <Link href={`/calendario/${event.id}`}>
      <Card className={muted ? "opacity-70 transition-shadow hover:shadow-md" : "transition-shadow hover:shadow-md"}>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(event.start_at)}</p>
            {event.location && <p className="truncate text-xs text-muted-foreground">{event.location}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant="outline">{TYPE_LABELS[event.event_type]}</Badge>
            {event.status === "cancelado" && <Badge variant="destructive">Cancelado</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
