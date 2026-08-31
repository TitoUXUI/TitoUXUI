import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { SimpleMarkdown } from "@/lib/simple-markdown";
import type { MinistryPage } from "@/lib/types/database.types";
import { updateMinistryPage } from "./actions";

export default async function VisionPage() {
  const { profile } = await requireUser();
  const supabase = createClient();

  const { data: page } = await supabase.from("ministry_page").select("*").eq("id", true).single<MinistryPage>();

  return (
    <>
      <TopBar title="Vision y estatuto" backHref="/mas" role={profile.role} />
      <main className="flex-1 space-y-4 p-4">
        <Card>
          <CardContent className="p-4">
            <SimpleMarkdown content={page?.content ?? ""} />
          </CardContent>
        </Card>

        {profile.role === "lider" && (
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-medium">Editar contenido</p>
              <form action={updateMinistryPage} className="space-y-3">
                <Textarea name="content" defaultValue={page?.content ?? ""} className="min-h-64 font-mono text-xs" />
                <p className="text-xs text-muted-foreground">
                  Usa # para titulo, ## para subtitulo, - para listas y **texto** para negrita.
                </p>
                <Button type="submit" variant="secondary">
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
