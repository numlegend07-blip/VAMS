import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/data/profile";
import { getBranches } from "@/lib/data/branches";
import { getAppSettings } from "@/lib/data/settings";
import SettingsForm from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "region_admin") {
    redirect("/valves");
  }

  const [branches, settings] = await Promise.all([getBranches(), getAppSettings()]);

  return <SettingsForm branches={branches} settings={settings} />;
}
