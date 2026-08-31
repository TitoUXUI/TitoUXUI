import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import type { Task } from "@/lib/types/database.types";
import { TaskItem } from "./task-item";

export default async function TareasPage() {
  const { profile } = await requireUser();
  const supabase = createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, profiles:assigned_to(full_name), events:event_id(title)")
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<(Task & { profiles: { full_name: string } | null; events: { title: string } | null })[]>();

  return (
    <>
      <TopBar
        title="Tareas"
        role={profile.role}
        action={
          profile.role === "lider" && (
            <ButtonLink href="/tareas/nueva" size="icon" aria-label="Nueva tarea">
              <PlusIcon className="h-5 w-5" />
            </ButtonLink>
          )
        }
      />
      <main className="flex-1 space-y-3 p-4">
        {profile.role === "anciano" && (
          <p className="text-xs text-muted-foreground">
            Como Anciano ves las tareas ya completadas del equipo, a modo de seguimiento.
          </p>
        )}
        {profile.role === "colaborador" && (
          <p className="text-xs text-muted-foreground">Solo ves las tareas asignadas a vos.</p>
        )}

        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              assigneeName={task.profiles?.full_name ?? null}
              eventTitle={task.events?.title ?? null}
              canToggle={profile.role === "lider" || task.assigned_to === profile.id}
            />
          ))
        ) : (
          <EmptyState title="No hay tareas" description={profile.role === "lider" ? "Crea la primera desde el boton +." : "Cuando el lider te asigne una tarea va a aparecer aca."} />
        )}
      </main>
    </>
  );
}
