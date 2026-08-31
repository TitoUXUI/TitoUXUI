import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import type { Profile } from "@/lib/types/database.types";
import { UserRow } from "./user-row";

export default async function UsuariosPage() {
  const { profile: current } = await requireRole("lider");
  const supabase = createClient();

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Profile[]>();

  return (
    <>
      <TopBar title="Usuarios y roles" backHref="/mas" />
      <main className="flex-1 space-y-4 p-4">
        <Alert>
          Todo usuario nuevo entra como <strong>Colaborador</strong> apenas confirma su primer login. Solo
          vos, como Lider, podes ascenderlo o cambiarle el rol.
        </Alert>
        <Card>
          <CardContent className="p-0">
            {usuarios?.map((profile) => (
              <UserRow key={profile.id} profile={profile} isSelf={profile.id === current.id} />
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
