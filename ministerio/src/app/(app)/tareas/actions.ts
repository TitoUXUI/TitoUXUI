"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, requireUser } from "@/lib/roles";
import type { TaskStatus } from "@/lib/types/database.types";

export async function createTask(formData: FormData) {
  const { userId } = await requireRole("lider");
  const supabase = createClient();

  const eventId = String(formData.get("event_id") || "");
  const dueDate = String(formData.get("due_date") || "");

  const { error } = await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    assigned_to: String(formData.get("assigned_to") || "") || null,
    event_id: eventId || null,
    due_date: dueDate || null,
    created_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/tareas");
  redirect("/tareas");
}

export async function setTaskStatus(taskId: string, status: TaskStatus) {
  await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tareas");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tareas");
}
