"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";

export async function createTeen(formData: FormData) {
  const { userId } = await requireRole("lider");
  const supabase = createClient();

  const { data: teen, error } = await supabase
    .from("teens")
    .insert({
      full_name: String(formData.get("full_name") ?? "").trim(),
      birth_date: String(formData.get("birth_date") ?? ""),
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !teen) throw new Error(error?.message ?? "No se pudo crear el adolescente");

  await supabase.from("teen_sensitive_info").insert({
    teen_id: teen.id,
    guardian_name: String(formData.get("guardian_name") ?? "").trim(),
    guardian_phone: String(formData.get("guardian_phone") ?? "").trim(),
    guardian_relationship: String(formData.get("guardian_relationship") ?? "").trim(),
    health_notes: String(formData.get("health_notes") ?? "").trim() || null,
    parental_consent: formData.get("parental_consent") === "on",
    parental_consent_date: formData.get("parental_consent") === "on" ? new Date().toISOString().slice(0, 10) : null,
    updated_by: userId,
  });

  revalidatePath("/directorio");
  redirect(`/directorio/${teen.id}`);
}

export async function updateTeenBasics(teenId: string, formData: FormData) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase
    .from("teens")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      birth_date: String(formData.get("birth_date") ?? ""),
      active: formData.get("active") === "on",
    })
    .eq("id", teenId);

  if (error) throw new Error(error.message);
  revalidatePath(`/directorio/${teenId}`);
  revalidatePath("/directorio");
}

export async function updateSensitiveInfo(teenId: string, formData: FormData) {
  const { userId } = await requireRole("lider");
  const supabase = createClient();

  const { error } = await supabase.from("teen_sensitive_info").upsert({
    teen_id: teenId,
    guardian_name: String(formData.get("guardian_name") ?? "").trim(),
    guardian_phone: String(formData.get("guardian_phone") ?? "").trim(),
    guardian_relationship: String(formData.get("guardian_relationship") ?? "").trim(),
    health_notes: String(formData.get("health_notes") ?? "").trim() || null,
    parental_consent: formData.get("parental_consent") === "on",
    parental_consent_date:
      formData.get("parental_consent") === "on"
        ? String(formData.get("parental_consent_date") || new Date().toISOString().slice(0, 10))
        : null,
    updated_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/directorio/${teenId}`);
}

export async function deleteTeen(teenId: string) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("teens").delete().eq("id", teenId);
  if (error) throw new Error(error.message);
  revalidatePath("/directorio");
  redirect("/directorio");
}
