"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";

export async function updateMinistryPage(formData: FormData) {
  const { userId } = await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase
    .from("ministry_page")
    .update({ content: String(formData.get("content") ?? ""), updated_by: userId })
    .eq("id", true);

  if (error) throw new Error(error.message);
  revalidatePath("/vision");
}
