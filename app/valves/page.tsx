import DashboardHeader from "@/components/dashboard/dashboard-header";
import ExecutiveSummary from "@/components/dashboard/executive-summary";
import DashboardCards from "@/components/dashboard/dashboard-cards";

import ValveStatusChart from "@/components/charts/valve-status-chart";
import ValveExplorer from "@/components/valves/valve-explorer";

import { getValves } from "@/lib/data/valves";

export default async function ValvePage() {
  const valves = await getValves();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ExecutiveSummary valves={valves} />
        </div>
        <ValveStatusChart valves={valves} />
      </div>

      <DashboardCards valves={valves} />

      <ValveExplorer valves={valves} />
    </div>
  );
}
