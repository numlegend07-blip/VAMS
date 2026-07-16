"use client";

import { useMemo, useState } from "react";
import { MapIcon, ChevronDown, Building2 } from "lucide-react";

import ValveMapClient from "@/components/map/valve-map-client";
import AddValveModal from "@/components/map/add-valve-modal";
import { Branch, ValveWithBranch } from "@/types";

const STATUS_LEGEND = [
  { label: "ใช้งาน", color: "#10b981" },
  { label: "ไม่ได้ใช้งาน", color: "#ef4444" },
  { label: "ไม่ระบุ", color: "#8b5cf6" },
];

type Props = {
  valves: ValveWithBranch[];
  branches: Branch[];
};

export default function MapView({ valves, branches }: Props) {
  const [branchId, setBranchId] = useState<string | "all">("all");

  const filteredValves = useMemo(() => {
    if (branchId === "all") return valves;
    return valves.filter((v) => v.branch_id === branchId);
  }, [valves, branchId]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            <MapIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-[15px] font-extrabold text-foreground">
              แผนที่จุดติดตั้งวาล์ว
            </h1>
            <p className="text-[11px] text-muted-foreground">
              เขต 10 · {filteredValves.length} จุด
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {STATUS_LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
              <Building2 className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value as string | "all")}
              className="appearance-none rounded-lg border border-border bg-surface-muted py-2 pl-9 pr-8 text-[13px] font-semibold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-subtle"
            >
              <option value="all">แสดงข้อมูลรวม (กปภ.ข.10)</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={2.25}
            />
          </div>

          <AddValveModal branches={branches} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div style={{ height: "70vh", minHeight: 480 }}>
          <ValveMapClient valves={filteredValves} />
        </div>
      </div>
    </div>
  );
}
