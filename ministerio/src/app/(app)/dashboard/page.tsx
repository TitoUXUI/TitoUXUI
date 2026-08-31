import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils";
import type { EventRow, Task } from "@/lib/types/database.types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { profile } = await requireUser();
  const supabase = createClient();

  const { data: proximosEventos } = await supabase
    .from("events")
    .select("*")
    .eq("status", "programado")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(3)
    .returns<EventRow[]>();

  const tasksQuery = supabase
    .from("tasks")
    .select("*")
    .eq("status", "pendiente")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(5);

  if (profile.role !== "lider") {
    tasksQuery.eq("assigned_to", profile.id);
  }

  const { data: tareasPendientes } = await tasksQuery.returns<Task[]>();

  return (
    <>
      <TopBar title={`Hola, ${profile.full_name.split(" ")[0] || "equipo"}`} role={profile.role} />
      <main className="flex-1 space-y-6 p-4">
        {searchParams.error === "sin_permiso" && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            No tenes permiso para ver esa seccion con tu rol actual.
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Proximos eventos</h2>
            <Link href="/calendario" className="text-sm text-primary">
              Ver todos
            </Link>
          </div>
          {proximosEventos && proximosEventos.length > 0 ? (
            <div className="space-y-2">
              {proximosEventos.map((event) => (
                <Link key={event.id} href={`/calendario/${event.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(event.start_at)}</p>
                      </div>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No hay eventos programados" description="El lider puede crear uno desde el calendario." />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {profile.role === "lider" ? "Tareas pendientes del equipo" : "Tus tareas pendientes"}
            </h2>
            <Link href="/tareas" className="text-sm text-primary">
              Ver todas
            </Link>
          </div>
          {tareasPendientes && tareasPendientes.length > 0 ? (
            <div className="space-y-2">
              {tareasPendientes.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">{task.title}</p>
                    {task.due_date && (
                      <p className="text-sm text-muted-foreground">
                        Vence {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(task.due_date))}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin tareas pendientes" description="Todo al dia por ahora." />
          )}
        </section>

        {profile.role === "anciano" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reporte para el consistorio</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/reportes" className="text-sm text-primary">
                Ver reporte mensual completo →
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
