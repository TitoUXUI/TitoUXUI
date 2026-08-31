"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types/database.types";
import { setTaskStatus } from "./actions";

export function TaskItem({
  task,
  assigneeName,
  eventTitle,
  canToggle,
}: {
  task: Task;
  assigneeName: string | null;
  eventTitle: string | null;
  canToggle: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const completed = task.status === "completada";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={completed}
          disabled={!canToggle || pending}
          onChange={(e) => {
            const status = e.target.checked ? "completada" : "pendiente";
            startTransition(() => setTaskStatus(task.id, status));
          }}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className={completed ? "font-medium line-through text-muted-foreground" : "font-medium"}>
            {task.title}
          </p>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {assigneeName && <Badge variant="outline">{assigneeName}</Badge>}
            {eventTitle && <Badge variant="outline">{eventTitle}</Badge>}
            {task.due_date && (
              <span>
                Vence {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(task.due_date))}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
