"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import type { AppRole } from "@/lib/types/database.types";

export async function updateUserRole(userId: string, role: AppRole) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/usuarios");
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/usuarios");
}
