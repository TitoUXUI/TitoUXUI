import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, MonthlyReport, Task } from "@/lib/types/database.types";

function shiftMonth(mes: string, delta: number) {
  const [y, m] = mes.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function csvEscape(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") ?? new Date().toISOString().slice(0, 7);

  const { data: reportRows } = await supabase.rpc("monthly_report", { p_month: `${mes}-01` });
  const report = (reportRows?.[0] ?? null) as MonthlyReport | null;

  const { data: eventos } = await supabase
    .from("events")
    .select("*")
    .gte("start_at", `${mes}-01`)
    .lt("start_at", `${shiftMonth(mes, 1)}-01`)
    .order("start_at", { ascending: true })
    .returns<EventRow[]>();

  const { data: tareas } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "completada")
    .gte("completed_at", `${mes}-01`)
    .lt("completed_at", `${shiftMonth(mes, 1)}-01`)
    .returns<Task[]>();

  const lines: string[] = [];
  lines.push("Reporte mensual - Ministerio de Adolescentes");
  lines.push(`Mes,${mes}`);
  lines.push("");
  lines.push("Resumen");
  lines.push(`Eventos totales,${report?.events_total ?? 0}`);
  lines.push(`Eventos cancelados,${report?.events_cancelados ?? 0}`);
  lines.push(`Confirmaciones de asistencia (voy),${report?.rsvps_confirmados ?? 0}`);
  lines.push(`No pueden asistir,${report?.rsvps_no_puede ?? 0}`);
  lines.push(`Tareas completadas,${report?.tasks_completadas ?? 0}`);
  lines.push("");
  lines.push("Eventos del mes");
  lines.push("Fecha,Titulo,Tipo,Estado");
  for (const e of eventos ?? []) {
    lines.push(
      [csvEscape(e.start_at.slice(0, 10)), csvEscape(e.title), csvEscape(e.event_type), csvEscape(e.status)].join(","),
    );
  }
  lines.push("");
  lines.push("Tareas completadas");
  lines.push("Titulo,Completada el");
  for (const t of tareas ?? []) {
    lines.push([csvEscape(t.title), csvEscape(t.completed_at?.slice(0, 10) ?? "")].join(","));
  }

  const csv = "﻿" + lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reporte-${mes}.csv"`,
    },
  });
}
