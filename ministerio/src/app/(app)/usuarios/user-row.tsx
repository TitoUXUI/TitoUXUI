"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { AppRole, Profile } from "@/lib/types/database.types";
import { updateUserRole, toggleUserActive } from "./actions";

export function UserRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [role, setRole] = useState<AppRole>(profile.role);
  const [active, setActive] = useState(profile.active);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border p-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{profile.full_name || "(sin nombre)"}</p>
        <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
        {!active && <Badge variant="destructive">Inactivo</Badge>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={role}
          disabled={isSelf || pending}
          onChange={(e) => {
            const newRole = e.target.value as AppRole;
            setRole(newRole);
            startTransition(() => updateUserRole(profile.id, newRole));
          }}
          className="h-9 w-36"
        >
          {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSelf || pending}
          onClick={() => {
            const next = !active;
            setActive(next);
            startTransition(() => toggleUserActive(profile.id, next));
          }}
        >
          {active ? "Desactivar" : "Activar"}
        </Button>
      </div>
    </div>
  );
}
