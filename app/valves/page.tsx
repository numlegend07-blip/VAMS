import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardView from "@/components/dashboard/dashboard-view";

import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";

export default async function ValvePage() {
  const [valves, branches] = await Promise.all([getValves(), getBranches()]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <DashboardHeader />
      <DashboardView valves={valves} branches={branches} />
    </div>
  );
}
