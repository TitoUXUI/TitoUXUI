"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarIcon, HomeIcon, MoreIcon, TasksIcon, WallIcon } from "@/components/ui/icons";

const items = [
  { href: "/dashboard", label: "Inicio", icon: HomeIcon },
  { href: "/calendario", label: "Calendario", icon: CalendarIcon },
  { href: "/tareas", label: "Tareas", icon: TasksIcon },
  { href: "/muro", label: "Muro", icon: WallIcon },
  { href: "/mas", label: "Mas", icon: MoreIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur safe-bottom">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
