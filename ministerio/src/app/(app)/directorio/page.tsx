import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { calculateAge } from "@/lib/utils";
import type { Teen } from "@/lib/types/database.types";

export default async function DirectorioPage() {
  const { profile } = await requireUser();
  if (profile.role === "anciano") redirect("/dashboard?error=sin_permiso");

  const supabase = createClient();
  const { data: teens } = await supabase
    .from("teens")
    .select("*")
    .order("full_name", { ascending: true })
    .returns<Teen[]>();

  return (
    <>
      <TopBar
        title="Directorio"
        role={profile.role}
        action={
          profile.role === "lider" && (
            <ButtonLink href="/directorio/nuevo" size="icon" aria-label="Nuevo adolescente">
              <PlusIcon className="h-5 w-5" />
            </ButtonLink>
          )
        }
      />
      <main className="flex-1 space-y-2 p-4">
        {profile.role === "colaborador" && (
          <p className="text-xs text-muted-foreground">
            Ves el listado basico. El contacto de emergencia y los datos de salud son visibles solo para
            Lideres.
          </p>
        )}

        {teens && teens.length > 0 ? (
          teens.map((teen) => (
            <Link key={teen.id} href={`/directorio/${teen.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{teen.full_name}</p>
                    <p className="text-sm text-muted-foreground">{calculateAge(teen.birth_date)} anos</p>
                  </div>
                  {!teen.active && <Badge variant="outline">Inactivo</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <EmptyState title="Sin adolescentes cargados" description="El lider puede agregar el primero." />
        )}
      </main>
    </>
  );
}
