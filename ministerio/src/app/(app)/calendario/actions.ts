"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, requireUser } from "@/lib/roles";
import type { EventType, RsvpStatus } from "@/lib/types/database.types";

export async function createEvent(formData: FormData) {
  const { userId } = await requireRole("lider");
  const supabase = createClient();

  const startDate = String(formData.get("start_date"));
  const startTime = String(formData.get("start_time") || "00:00");
  const endDate = String(formData.get("end_date") || startDate);
  const endTime = String(formData.get("end_time") || "");

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      event_type: String(formData.get("event_type")) as EventType,
      location: String(formData.get("location") ?? "").trim() || null,
      start_at: new Date(`${startDate}T${startTime}`).toISOString(),
      end_at: endTime ? new Date(`${endDate}T${endTime}`).toISOString() : null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !event) throw new Error(error?.message ?? "No se pudo crear el evento");

  revalidatePath("/calendario");
  redirect(`/calendario/${event.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  await requireRole("lider");
  const supabase = createClient();

  const startDate = String(formData.get("start_date"));
  const startTime = String(formData.get("start_time") || "00:00");
  const endDate = String(formData.get("end_date") || startDate);
  const endTime = String(formData.get("end_time") || "");

  const { error } = await supabase
    .from("events")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      event_type: String(formData.get("event_type")) as EventType,
      location: String(formData.get("location") ?? "").trim() || null,
      start_at: new Date(`${startDate}T${startTime}`).toISOString(),
      end_at: endTime ? new Date(`${endDate}T${endTime}`).toISOString() : null,
    })
    .eq("id", eventId);

  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
  revalidatePath("/calendario");
}

export async function setEventStatus(eventId: string, status: "programado" | "cancelado") {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("events").update({ status }).eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
  revalidatePath("/calendario");
}

export async function setRsvp(eventId: string, status: RsvpStatus) {
  const { userId } = await requireUser();
  const supabase = createClient();
  const { error } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId, status, responded_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
}

export async function createStage(eventId: string, formData: FormData) {
  await requireRole("lider");
  const supabase = createClient();

  const eventDate = String(formData.get("event_date"));
  const time = String(formData.get("time"));
  const assignedTo = String(formData.get("assigned_to") || "");

  const { data: maxSort } = await supabase
    .from("event_stages")
    .select("sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("event_stages").insert({
    event_id: eventId,
    title: String(formData.get("title") ?? "").trim(),
    starts_at: new Date(`${eventDate}T${time}`).toISOString(),
    sort_order: (maxSort?.sort_order ?? 0) + 1,
    assigned_to: assignedTo || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
}

export async function updateStage(eventId: string, stageId: string, formData: FormData) {
  await requireRole("lider");
  const supabase = createClient();

  const eventDate = String(formData.get("event_date"));
  const time = String(formData.get("time"));
  const assignedTo = String(formData.get("assigned_to") || "");

  const { error } = await supabase
    .from("event_stages")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      starts_at: new Date(`${eventDate}T${time}`).toISOString(),
      assigned_to: assignedTo || null,
    })
    .eq("id", stageId);

  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
}

export async function deleteStage(eventId: string, stageId: string) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("event_stages").delete().eq("id", stageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/calendario/${eventId}`);
}
