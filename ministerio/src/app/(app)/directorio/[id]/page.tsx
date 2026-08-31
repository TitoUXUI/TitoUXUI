import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateAge } from "@/lib/utils";
import type { Teen, TeenSensitiveInfo } from "@/lib/types/database.types";
import { updateTeenBasics, updateSensitiveInfo, deleteTeen } from "../actions";

export default async function AdolescenteDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireUser();
  if (profile.role === "anciano") redirect("/dashboard?error=sin_permiso");

  const supabase = createClient();
  const { data: teen } = await supabase.from("teens").select("*").eq("id", params.id).single<Teen>();
  if (!teen) notFound();

  let sensitive: TeenSensitiveInfo | null = null;
  if (profile.role === "lider") {
    const { data } = await supabase
      .from("teen_sensitive_info")
      .select("*")
      .eq("teen_id", params.id)
      .maybeSingle<TeenSensitiveInfo>();
    sensitive = data;
  }

  const updateBasics = updateTeenBasics.bind(null, teen.id);
  const updateSensitive = updateSensitiveInfo.bind(null, teen.id);
  const removeTeen = deleteTeen.bind(null, teen.id);

  return (
    <>
      <TopBar title={teen.full_name} backHref="/directorio" role={profile.role} />
      <main className="flex-1 space-y-6 p-4">
        {profile.role === "lider" ? (
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Datos basicos</h2>
              <form action={updateBasics} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input id="full_name" name="full_name" defaultValue={teen.full_name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                  <Input id="birth_date" name="birth_date" type="date" defaultValue={teen.birth_date} required />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox name="active" defaultChecked={teen.active} />
                  Activo en el ministerio
                </label>
                <Button type="submit" variant="secondary">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-1 p-4">
              <p>
                <span className="text-muted-foreground">Fecha de nacimiento: </span>
                {formatDate(teen.birth_date)} ({calculateAge(teen.birth_date)} anos)
              </p>
              {!teen.active && <Badge variant="outline">Inactivo</Badge>}
            </CardContent>
          </Card>
        )}

        {profile.role === "lider" && (
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Contacto de emergencia y salud (solo Lideres)
              </h2>
              <form action={updateSensitive} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guardian_name">Nombre del padre/madre/tutor</Label>
                  <Input id="guardian_name" name="guardian_name" defaultValue={sensitive?.guardian_name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guardian_relationship">Relacion</Label>
                  <Input
                    id="guardian_relationship"
                    name="guardian_relationship"
                    defaultValue={sensitive?.guardian_relationship}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guardian_phone">Telefono de contacto</Label>
                  <Input id="guardian_phone" name="guardian_phone" type="tel" defaultValue={sensitive?.guardian_phone} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="health_notes">Alergias / notas de salud</Label>
                  <Textarea id="health_notes" name="health_notes" defaultValue={sensitive?.health_notes ?? ""} />
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox name="parental_consent" defaultChecked={sensitive?.parental_consent ?? false} />
                  <span>
                    Consentimiento de los padres registrado
                    {sensitive?.parental_consent_date && ` (fecha: ${formatDate(sensitive.parental_consent_date)})`}
                  </span>
                </label>
                <div className="space-y-1.5">
                  <Label htmlFor="parental_consent_date">Fecha de consentimiento</Label>
                  <Input
                    id="parental_consent_date"
                    name="parental_consent_date"
                    type="date"
                    defaultValue={sensitive?.parental_consent_date ?? ""}
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Guardar datos sensibles
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {profile.role === "lider" && (
          <form action={removeTeen}>
            <Button type="submit" variant="destructive" className="w-full">
              Eliminar del directorio
            </Button>
          </form>
        )}
      </main>
    </>
  );
}
