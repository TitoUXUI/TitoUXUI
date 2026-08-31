"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import type { RsvpStatus } from "@/lib/types/database.types";
import { setRsvp } from "./actions";

export function RsvpButtons({ eventId, current }: { eventId: string; current: RsvpStatus | null }) {
  const [pending, startTransition] = useTransition();

  function respond(status: RsvpStatus) {
    startTransition(() => setRsvp(eventId, status));
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant={current === "confirmado" ? "primary" : "outline"}
        disabled={pending}
        onClick={() => respond("confirmado")}
      >
        <CheckIcon className="h-4 w-4" /> Voy
      </Button>
      <Button
        type="button"
        size="sm"
        variant={current === "no_puedo" ? "destructive" : "outline"}
        disabled={pending}
        onClick={() => respond("no_puedo")}
      >
        <XIcon className="h-4 w-4" /> No puedo
      </Button>
    </div>
  );
}
