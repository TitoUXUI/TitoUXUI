"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "@/components/ui/icons";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
      <LogOutIcon className="h-4 w-4" /> Cerrar sesion
    </Button>
  );
}
