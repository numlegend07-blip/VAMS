"use client";

import { useState } from "react";

import SearchBox from "@/components/search/search-box";
import ValveTable from "@/components/valves/valve-table";
import { ValveWithBranch } from "@/types";

type Props = {
  valves: ValveWithBranch[];
};

export default function ValveExplorer({ valves }: Props) {
  const [search, setSearch] = useState("");

  const filteredValves = valves.filter((valve) => {
    const keyword = search.toLowerCase();

    return (
      valve.branch.name.toLowerCase().includes(keyword) ||
      valve.brand.toLowerCase().includes(keyword) ||
      valve.valve_type.toLowerCase().includes(keyword) ||
      (valve.asset_code ?? "").toLowerCase().includes(keyword)
    );
  });

  return (
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
  );
}
