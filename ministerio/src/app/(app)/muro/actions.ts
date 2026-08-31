"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, requireUser } from "@/lib/roles";
import type { WallPostType } from "@/lib/types/database.types";

export async function createPost(formData: FormData) {
  const { userId, profile } = await requireUser();
  const type = String(formData.get("type")) as WallPostType;

  if (type === "anuncio" && profile.role !== "lider") {
    throw new Error("Solo los lideres pueden publicar anuncios");
  }

  const supabase = createClient();
  const { error } = await supabase.from("wall_posts").insert({
    type,
    title: type === "anuncio" ? String(formData.get("title") ?? "").trim() || null : null,
    content: String(formData.get("content") ?? "").trim(),
    author_id: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/muro");
}

export async function deletePost(postId: string) {
  await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("wall_posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/muro");
}

export async function togglePin(postId: string, pinned: boolean) {
  await requireRole("lider");
  const supabase = createClient();
  const { error } = await supabase.from("wall_posts").update({ pinned }).eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/muro");
}
