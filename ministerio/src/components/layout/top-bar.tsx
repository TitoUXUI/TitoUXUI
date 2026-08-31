import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { AppRole } from "@/lib/types/database.types";

export function TopBar({
  title,
  role,
  backHref,
  action,
}: {
  title: string;
  role?: AppRole;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="safe-top sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      {backHref && (
        <Link href={backHref} className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Volver">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
      {role && <Badge variant="outline">{ROLE_LABELS[role]}</Badge>}
      {action}
    </header>
  );
}
