"use client";

import { useMemo, useState } from "react";

import DashboardTitleBar from "@/components/dashboard/dashboard-title-bar";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import ValveStatusChart from "@/components/charts/valve-status-chart";
import ValvesByBranchChart from "@/components/charts/valves-by-branch-chart";
import ValveExplorer from "@/components/valves/valve-explorer";

import { Branch, ValveWithBranch } from "@/types";

type Props = {
  valves: ValveWithBranch[];
  branches: Branch[];
};

export default function DashboardView({ valves, branches }: Props) {
  const [branchId, setBranchId] = useState<string | "all">("all");

  const filteredValves = useMemo(() => {
    if (branchId === "all") return valves;
    return valves.filter((v) => v.branch_id === branchId);
  }, [valves, branchId]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardTitleBar branches={branches} value={branchId} onChange={setBranchId} />

      <DashboardCards valves={filteredValves} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ValveStatusChart valves={filteredValves} />
        </div>
        <div className="lg:col-span-3">
          <ValvesByBranchChart
            valves={valves}
            branches={branches}
            onSelectBranch={(id) => setBranchId(id ?? "all")}
          />
        </div>
      </div>

      <ValveExplorer valves={filteredValves} />
    </div>
  );
}
