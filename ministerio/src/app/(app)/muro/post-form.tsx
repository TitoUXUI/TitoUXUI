"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { WallPostType } from "@/lib/types/database.types";
import { createPost } from "./actions";

export function PostForm({ canPostAnuncio }: { canPostAnuncio: boolean }) {
  const [type, setType] = useState<WallPostType>("oracion");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {canPostAnuncio && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("oracion")}
              className={`rounded-full px-3 py-1 text-sm ${type === "oracion" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              Motivo de oracion
            </button>
            <button
              type="button"
              onClick={() => setType("anuncio")}
              className={`rounded-full px-3 py-1 text-sm ${type === "anuncio" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              Anuncio
            </button>
          </div>
        )}
        <form
          ref={formRef}
          action={async (formData) => {
            await createPost(formData);
            formRef.current?.reset();
          }}
          className="space-y-3"
        >
          <input type="hidden" name="type" value={type} />
          {type === "anuncio" && (
            <div className="space-y-1.5">
              <Label htmlFor="title">Titulo</Label>
              <Input id="title" name="title" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="content">{type === "anuncio" ? "Anuncio" : "Motivo de oracion"}</Label>
            <Textarea id="content" name="content" required placeholder={type === "anuncio" ? "Escribi el anuncio..." : "Pidamos por..."} />
          </div>
          <Button type="submit" size="sm">
            Publicar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
