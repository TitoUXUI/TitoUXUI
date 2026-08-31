import { BottomNav } from "@/components/layout/bottom-nav";
import { requireUser } from "@/lib/roles";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
