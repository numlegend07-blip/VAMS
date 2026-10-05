"use client";

import { useState } from "react";
import { ChevronDown, ListFilter } from "lucide-react";

import SearchBox from "@/components/search/search-box";
import ValveTable from "@/components/valves/valve-table";
import CardHeader from "@/components/ui/card-header";
import { ValveWithBranch } from "@/types";
import { EFFECTIVE_STATUS_NAME, EffectiveStatus, getEffectiveStatus } from "@/lib/valve-effective-status";

type Props = {
  valves: ValveWithBranch[];
  status: EffectiveStatus | "all";
  onStatusChange: (status: EffectiveStatus | "all") => void;
};

const STATUS_OPTIONS: EffectiveStatus[] = ["ใช้งาน", "ไม่ได้ใช้งาน", "ชำรุด"];

export default function ValveExplorer({ valves, status, onStatusChange }: Props) {
  const [search, setSearch] = useState("");

  const filteredValves = valves.filter((valve) => {
    if (status !== "all" && getEffectiveStatus(valve) !== status) return false;

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
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as EffectiveStatus | "all")}
                className="appearance-none rounded-lg border border-border bg-surface-muted py-2.5 pl-3.5 pr-8 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-subtle"
              >
                <option value="all">ทุกสถานะ</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {EFFECTIVE_STATUS_NAME[s]}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.25}
              />
            </div>

            <div className="w-44 sm:w-72">
              <SearchBox value={search} onChange={setSearch} />
            </div>
          </div>
        }
      />

      <div className="p-4.5">
        <ValveTable valves={filteredValves} />
      </div>
    </div>
  );
}
