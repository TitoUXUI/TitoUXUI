import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { EventRow, Profile } from "@/lib/types/database.types";
import { createTask } from "../actions";

export default async function NuevaTareaPage() {
  await requireRole("lider");
  const supabase = createClient();

  const [{ data: personas }, { data: eventos }] = await Promise.all([
    supabase.from("profiles").select("*").in("role", ["lider", "colaborador"]).eq("active", true).returns<Profile[]>(),
    supabase
      .from("events")
      .select("*")
      .eq("status", "programado")
      .order("start_at", { ascending: true })
      .returns<EventRow[]>(),
  ]);

  return (
    <>
      <TopBar title="Nueva tarea" backHref="/tareas" />
      <main className="flex-1 p-4">
        <form action={createTask} className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Titulo</Label>
                <Input id="title" name="title" required placeholder="Comprar merienda" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripcion (opcional)</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assigned_to">Responsable</Label>
                <Select id="assigned_to" name="assigned_to" required defaultValue="">
                  <option value="" disabled>
                    Elegi un responsable
                  </option>
                  {(personas ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_date">Fecha limite (opcional)</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event_id">Vincular a un evento (opcional)</Label>
                <Select id="event_id" name="event_id" defaultValue="">
                  <option value="">Sin vincular</option>
                  {(eventos ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full">
            Crear tarea
          </Button>
        </form>
      </main>
    </>
  );
}
