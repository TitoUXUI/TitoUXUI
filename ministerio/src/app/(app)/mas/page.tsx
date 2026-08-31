import Link from "next/link";
import { requireUser } from "@/lib/roles";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { NotificationSettings } from "@/components/notification-settings";
import { BookIcon, ReportIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";

export default async function MasPage() {
  const { profile } = await requireUser();

  const links = [
    ...(profile.role !== "anciano"
      ? [{ href: "/directorio", label: "Directorio de adolescentes", icon: UsersIcon }]
      : []),
    { href: "/vision", label: "Vision y estatuto", icon: BookIcon },
    { href: "/reportes", label: "Reporte mensual", icon: ReportIcon },
    ...(profile.role === "lider" ? [{ href: "/usuarios", label: "Usuarios y roles", icon: ShieldIcon }] : []),
  ];

  return (
    <>
      <TopBar title="Mas" role={profile.role} />
      <main className="flex-1 space-y-4 p-4">
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-4 hover:bg-secondary">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <NotificationSettings />

        <div className="space-y-2 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">{profile.full_name || profile.email}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <LogoutButton />
        </div>
      </main>
    </>
  );
}
