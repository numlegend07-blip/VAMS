import AppShell from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/data/profile";
import { getDueValves } from "@/lib/data/pm-history";

export default async function ValvesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, dueValves] = await Promise.all([getCurrentProfile(), getDueValves()]);

  return (
    <AppShell profile={profile} dueValves={dueValves}>
      {children}
    </AppShell>
  );
}
