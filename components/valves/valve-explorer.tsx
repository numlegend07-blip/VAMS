"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";

import SearchBox from "@/components/search/search-box";
import ValveTable from "@/components/valves/valve-table";
import CardHeader from "@/components/ui/card-header";
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
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <CardHeader
        icon={ListFilter}
        title="รายการ Control Valve"
        action={
          <div className="w-44 sm:w-72">
            <SearchBox value={search} onChange={setSearch} />
          </div>
        }
      />

      <div className="p-4.5">
        <ValveTable valves={filteredValves} />
      </div>
    </div>
  );
}
