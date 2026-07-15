"use client";

import { useMemo, useState } from "react";

import BranchFilter from "@/components/dashboard/branch-filter";
import ExecutiveSummary from "@/components/dashboard/executive-summary";
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
      <BranchFilter
        branches={branches}
        value={branchId}
        onChange={setBranchId}
        resultCount={filteredValves.length}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ExecutiveSummary valves={filteredValves} />
        </div>
        <ValveStatusChart valves={filteredValves} />
      </div>

      <DashboardCards valves={filteredValves} />

      <ValvesByBranchChart
        valves={valves}
        selectedBranchId={branchId === "all" ? null : branchId}
        onSelectBranch={(id) => setBranchId(id ?? "all")}
      />

      <ValveExplorer valves={filteredValves} />
    </div>
  );
}
