import { requireRole } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createEvent } from "../actions";

export default async function NuevoEventoPage() {
  await requireRole("lider");

  return (
    <>
      <TopBar title="Nuevo evento" backHref="/calendario" />
      <main className="flex-1 p-4">
        <form action={createEvent} className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Titulo</Label>
                <Input id="title" name="title" required placeholder="Reunion de jovenes" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event_type">Tipo</Label>
                <Select id="event_type" name="event_type" defaultValue="reunion">
                  <option value="reunion">Reunion</option>
                  <option value="campamento">Campamento</option>
                  <option value="evento">Evento</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">Fecha de inicio</Label>
                  <Input id="start_date" name="start_date" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">Hora de inicio</Label>
                  <Input id="start_time" name="start_time" type="time" defaultValue="19:00" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="end_date">Fecha de fin (opcional)</Label>
                  <Input id="end_date" name="end_date" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time">Hora de fin (opcional)</Label>
                  <Input id="end_time" name="end_time" type="time" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Lugar</Label>
                <Input id="location" name="location" placeholder="Salon principal" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea id="description" name="description" />
              </div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full">
            Crear evento
          </Button>
        </form>
      </main>
    </>
  );
}
