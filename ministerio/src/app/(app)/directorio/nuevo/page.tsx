import { requireRole } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { createTeen } from "../actions";

export default async function NuevoAdolescentePage() {
  await requireRole("lider");

  return (
    <>
      <TopBar title="Nuevo adolescente" backHref="/directorio" />
      <main className="flex-1 p-4">
        <form action={createTeen} className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Datos basicos</h2>
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                <Input id="birth_date" name="birth_date" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Contacto de emergencia y salud (visible solo para Lideres)
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_name">Nombre del padre/madre/tutor</Label>
                <Input id="guardian_name" name="guardian_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_relationship">Relacion</Label>
                <Input id="guardian_relationship" name="guardian_relationship" placeholder="Madre, Padre, Tutor..." required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_phone">Telefono de contacto</Label>
                <Input id="guardian_phone" name="guardian_phone" type="tel" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="health_notes">Alergias / notas de salud (opcional)</Label>
                <Textarea id="health_notes" name="health_notes" placeholder="Sin datos relevantes" />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox name="parental_consent" />
                <span>Consentimiento de los padres registrado (se guarda con la fecha de hoy)</span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Guardar adolescente
          </Button>
        </form>
      </main>
    </>
  );
}
