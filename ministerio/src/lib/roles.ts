import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types/database.types";

export { ROLE_LABELS } from "@/lib/role-labels";

/**
 * Trae el usuario autenticado + su profile. Redirige a /login si no hay
 * sesion (defensa en profundidad: el middleware ya deberia haber
 * redirigido antes de llegar aca).
 */
export async function requireUser(): Promise<{ userId: string; profile: Profile }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) redirect("/login");

  return { userId: user.id, profile: profile as Profile };
}

/** Redirige a /dashboard con un aviso si el rol no esta permitido. */
export async function requireRole(...allowed: AppRole[]) {
  const { profile, userId } = await requireUser();
  if (!allowed.includes(profile.role)) {
    redirect("/dashboard?error=sin_permiso");
  }
  return { profile, userId };
}
