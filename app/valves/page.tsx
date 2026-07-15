"use client";

import { useState } from "react";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import ExecutiveSummary from "@/components/dashboard/executive-summary";
import DashboardCards from "@/components/dashboard/dashboard-cards";

import ValveStatusChart from "@/components/charts/valve-status-chart";

import SearchBox from "@/components/search/search-box";
import ValveTable from "@/components/valves/valve-table";

import { controlValves } from "@/data/control-valves";

export default function ValvePage() {
  const [search, setSearch] = useState("");

  const filteredValves = controlValves.filter((valve) => {
    const keyword = search.toLowerCase();

    return (
      valve.id.toLowerCase().includes(keyword) ||
      valve.branch.toLowerCase().includes(keyword) ||
      valve.brand.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ExecutiveSummary />
        </div>
        <ValveStatusChart />
      </div>

      <DashboardCards />

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">
            รายการ Control Valve
          </h2>
          <div className="sm:w-80">
            <SearchBox value={search} onChange={setSearch} />
          </div>
        </div>

        <ValveTable valves={filteredValves} />
      </div>
    </div>
  );
}
