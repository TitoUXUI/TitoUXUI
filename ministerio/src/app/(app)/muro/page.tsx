import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { WallPost } from "@/lib/types/database.types";
import { PostForm } from "./post-form";
import { deletePost, togglePin } from "./actions";

export default async function MuroPage() {
  const { profile, userId } = await requireUser();
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("wall_posts")
    .select("*, profiles:author_id(full_name)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<(WallPost & { profiles: { full_name: string } | null })[]>();

  return (
    <>
      <TopBar title="Muro" role={profile.role} />
      <main className="flex-1 space-y-4 p-4">
        <PostForm canPostAnuncio={profile.role === "lider"} />

        {posts && posts.length > 0 ? (
          posts.map((post) => {
            const canManage = post.author_id === userId || profile.role === "lider";
            return (
              <Card key={post.id}>
                <CardContent className="space-y-1.5 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={post.type === "anuncio" ? "default" : "success"}>
                      {post.type === "anuncio" ? "Anuncio" : "Oracion"}
                    </Badge>
                    {post.pinned && <Badge variant="outline">Fijado</Badge>}
                  </div>
                  {post.title && <p className="font-medium">{post.title}</p>}
                  <p className="text-sm">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.profiles?.full_name || "Alguien del equipo"} · {formatDateTime(post.created_at)}
                  </p>
                  {canManage && (
                    <div className="flex gap-2 pt-1">
                      {profile.role === "lider" && post.type === "anuncio" && (
                        <form action={togglePin.bind(null, post.id, !post.pinned)}>
                          <Button type="submit" size="sm" variant="outline">
                            {post.pinned ? "Desfijar" : "Fijar"}
                          </Button>
                        </form>
                      )}
                      <form action={deletePost.bind(null, post.id)}>
                        <Button type="submit" size="sm" variant="ghost">
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState title="Todavia no hay publicaciones" />
        )}
      </main>
    </>
  );
}
