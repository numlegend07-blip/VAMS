import DashboardView from "@/components/dashboard/dashboard-view";

import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";
import { getCurrentProfile } from "@/lib/data/profile";
import { getAppSettings } from "@/lib/data/settings";

export default async function ValvePage() {
  const [valves, branches, profile, settings] = await Promise.all([
    getValves(),
    getBranches(),
    getCurrentProfile(),
    getAppSettings(),
  ]);

  const telegramJoin =
    profile?.role === "region_admin"
      ? settings.telegram_region_invite_link
        ? { label: "เขต 10 (สรุปรวม)", link: settings.telegram_region_invite_link }
        : null
      : (() => {
          const branch = branches.find((b) => b.id === profile?.branch_id);
          return branch?.telegram_invite_link
            ? { label: branch.name, link: branch.telegram_invite_link }
            : null;
        })();

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardView valves={valves} branches={branches} telegramJoin={telegramJoin} />
    </div>
  );
}
