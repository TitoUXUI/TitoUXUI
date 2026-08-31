import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ChevronLeftIcon, ReportIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import type { EventRow, MonthlyReport, Task } from "@/lib/types/database.types";

const TYPE_LABELS: Record<string, string> = { reunion: "Reunion", campamento: "Campamento", evento: "Evento" };

function monthLabel(iso: string) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(new Date(iso + "T00:00:00"));
}

function shiftMonth(mes: string, delta: number) {
  const [y, m] = mes.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportesPage({ searchParams }: { searchParams: { mes?: string } }) {
  const { profile } = await requireUser();
  const mes = searchParams.mes ?? new Date().toISOString().slice(0, 7);
  const supabase = createClient();

  const { data: reportRows } = await supabase.rpc("monthly_report", { p_month: `${mes}-01` });
  const report = (reportRows?.[0] ?? null) as MonthlyReport | null;

  const { data: eventos } = await supabase
    .from("events")
    .select("*")
    .gte("start_at", `${mes}-01`)
    .lt("start_at", `${shiftMonth(mes, 1)}-01`)
    .order("start_at", { ascending: true })
    .returns<EventRow[]>();

  const { data: tareasCompletadas } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "completada")
    .gte("completed_at", `${mes}-01`)
    .lt("completed_at", `${shiftMonth(mes, 1)}-01`)
    .returns<Task[]>();

  return (
    <>
      <TopBar title="Reporte mensual" role={profile.role} />
      <main className="flex-1 space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Link href={`/reportes?mes=${shiftMonth(mes, -1)}`} className="rounded-lg p-2 hover:bg-secondary" aria-label="Mes anterior">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <p className="font-medium capitalize">{monthLabel(`${mes}-01`)}</p>
          <Link
            href={`/reportes?mes=${shiftMonth(mes, 1)}`}
            className="rounded-lg p-2 hover:bg-secondary"
            aria-label="Mes siguiente"
          >
            <ChevronLeftIcon className="h-5 w-5 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Eventos del mes" value={report?.events_total ?? 0} />
          <StatCard label="Cancelados" value={report?.events_cancelados ?? 0} />
          <StatCard label="Confirmaciones (voy)" value={report?.rsvps_confirmados ?? 0} />
          <StatCard label="Tareas completadas" value={report?.tasks_completadas ?? 0} />
        </div>

        <a
          href={`/api/reportes/csv?mes=${mes}`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
        >
          <ReportIcon className="h-4 w-4" /> Descargar CSV para el consistorio
        </a>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Eventos del mes</h2>
          {eventos && eventos.length > 0 ? (
            eventos.map((e) => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <span>
                    {formatDate(e.start_at)} — {e.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {TYPE_LABELS[e.event_type]}
                    {e.status === "cancelado" ? " · cancelado" : ""}
                  </span>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState title="Sin eventos este mes" />
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Tareas completadas</h2>
          {tareasCompletadas && tareasCompletadas.length > 0 ? (
            tareasCompletadas.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-3 text-sm">{t.title}</CardContent>
              </Card>
            ))
          ) : (
            <EmptyState title="Sin tareas completadas este mes" />
          )}
        </section>

        {profile.role === "lider" && (
          <ButtonLink href="/vision" variant="outline" className="w-full">
            Ver vision y estatuto del ministerio
          </ButtonLink>
        )}
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
