import AppShell from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/data/profile";

export default async function ValvesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
