import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/alert";
import { ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import type { EventRow, EventStage, EventType, Profile, RsvpStatus } from "@/lib/types/database.types";
import {
  createStage,
  deleteStage,
  setEventStatus,
  setRsvp,
  updateEvent,
  updateStage,
} from "../actions";
import { RsvpButtons } from "../rsvp-buttons";

const TYPE_LABELS: Record<EventType, string> = {
  reunion: "Reunion",
  campamento: "Campamento",
  evento: "Evento",
};

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const { profile, userId } = await requireUser();
  const supabase = createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", params.id).single<EventRow>();
  if (!event) notFound();

  const [{ data: rsvps }, { data: stages }, { data: assignable }] = await Promise.all([
    supabase
      .from("event_rsvps")
      .select("user_id, status, profiles!inner(full_name)")
      .eq("event_id", params.id),
    supabase.from("event_stages").select("*").eq("event_id", params.id).order("sort_order").returns<EventStage[]>(),
    supabase
      .from("profiles")
      .select("*")
      .in("role", ["lider", "colaborador"])
      .eq("active", true)
      .returns<Profile[]>(),
  ]);

  const myRsvp = (rsvps ?? []).find((r) => r.user_id === userId) as
    | { user_id: string; status: RsvpStatus }
    | undefined;
  const confirmados = (rsvps ?? []).filter((r) => r.status === "confirmado") as unknown as {
    user_id: string;
    status: RsvpStatus;
    profiles: { full_name: string };
  }[];

  const eventDateForInputs = event.start_at.slice(0, 10);
  const boundUpdateEvent = updateEvent.bind(null, event.id);
  const boundCreateStage = createStage.bind(null, event.id);

  return (
    <>
      <TopBar title={event.title} backHref="/calendario" role={profile.role} />
      <main className="flex-1 space-y-6 p-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{TYPE_LABELS[event.event_type]}</Badge>
              {event.status === "cancelado" && <Badge variant="destructive">Cancelado</Badge>}
            </div>
            <p className="flex items-center gap-1.5 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              {formatDateTime(event.start_at)}
              {event.end_at && ` — ${formatDateTime(event.end_at)}`}
            </p>
            {event.location && (
              <p className="flex items-center gap-1.5 text-sm">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" /> {event.location}
              </p>
            )}
            {event.description && <p className="pt-2 text-sm text-muted-foreground">{event.description}</p>}
          </CardContent>
        </Card>

        {profile.role !== "anciano" && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Tu asistencia</h2>
            <RsvpButtons eventId={event.id} current={myRsvp?.status ?? null} />
            <p className="text-sm text-muted-foreground">
              {confirmados.length > 0
                ? `Confirmaron: ${confirmados.map((c) => c.profiles.full_name).join(", ")}`
                : "Nadie confirmo asistencia todavia."}
            </p>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Itinerario</h2>
          {stages && stages.length > 0 ? (
            <div className="space-y-2">
              {stages.map((stage) => (
                <StageRow key={stage.id} stage={stage} eventId={event.id} assignable={assignable ?? []} isLider={profile.role === "lider"} />
              ))}
            </div>
          ) : (
            <EmptyState title="Sin etapas cargadas" description="El lider puede definir el itinerario (merienda, juegos, predica, etc.)." />
          )}

          {profile.role === "lider" && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">Agregar etapa</p>
                <form action={boundCreateStage} className="space-y-3">
                  <input type="hidden" name="event_date" value={eventDateForInputs} />
                  <div className="grid grid-cols-[1fr,auto] gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="stage_title">Titulo</Label>
                      <Input id="stage_title" name="title" placeholder="Merienda" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stage_time">Hora</Label>
                      <Input id="stage_time" name="time" type="time" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stage_assigned_to">Responsable (opcional)</Label>
                    <Select id="stage_assigned_to" name="assigned_to" defaultValue="">
                      <option value="">Sin responsable (avisa a todos los que confirmaron)</option>
                      {(assignable ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name || p.email}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    Agregar etapa
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        {profile.role === "lider" && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Editar evento</h2>
            <Card>
              <CardContent className="space-y-4 p-4">
                <form action={boundUpdateEvent} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Titulo</Label>
                    <Input id="title" name="title" defaultValue={event.title} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="event_type">Tipo</Label>
                    <Select id="event_type" name="event_type" defaultValue={event.event_type}>
                      <option value="reunion">Reunion</option>
                      <option value="campamento">Campamento</option>
                      <option value="evento">Evento</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="start_date">Fecha de inicio</Label>
                      <Input id="start_date" name="start_date" type="date" defaultValue={eventDateForInputs} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="start_time">Hora de inicio</Label>
                      <Input id="start_time" name="start_time" type="time" defaultValue={formatTime(event.start_at)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Lugar</Label>
                    <Input id="location" name="location" defaultValue={event.location ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea id="description" name="description" defaultValue={event.description ?? ""} />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                    Guardar cambios
                  </Button>
                </form>

                <form action={setEventStatus.bind(null, event.id, event.status === "cancelado" ? "programado" : "cancelado")}>
                  <Button type="submit" variant={event.status === "cancelado" ? "outline" : "destructive"} className="w-full">
                    {event.status === "cancelado" ? "Reactivar evento" : "Cancelar evento"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </>
  );
}

function StageRow({
  stage,
  eventId,
  assignable,
  isLider,
}: {
  stage: EventStage;
  eventId: string;
  assignable: Profile[];
  isLider: boolean;
}) {
  const responsable = assignable.find((p) => p.id === stage.assigned_to);
  const boundUpdate = updateStage.bind(null, eventId, stage.id);
  const boundDelete = deleteStage.bind(null, eventId, stage.id);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {formatTime(stage.starts_at)} — {stage.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {responsable ? `Responsable: ${responsable.full_name || responsable.email}` : "Avisa a todos los colaboradores confirmados"}
            </p>
          </div>
        </div>

        {isLider && (
          <details className="text-sm">
            <summary className="cursor-pointer text-primary">Editar etapa</summary>
            <form action={boundUpdate} className="mt-3 space-y-3">
              <input type="hidden" name="event_date" value={stage.starts_at.slice(0, 10)} />
              <div className="grid grid-cols-[1fr,auto] gap-3">
                <Input name="title" defaultValue={stage.title} required />
                <Input name="time" type="time" defaultValue={formatTime(stage.starts_at)} required />
              </div>
              <Select name="assigned_to" defaultValue={stage.assigned_to ?? ""}>
                <option value="">Sin responsable</option>
                {assignable.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="secondary">
                  Guardar
                </Button>
              </div>
            </form>
            <form action={boundDelete} className="mt-2">
              <Button type="submit" size="sm" variant="destructive">
                Eliminar etapa
              </Button>
            </form>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
