"use client";

import { useMemo, useState } from "react";
import { MapIcon, ChevronDown, Building2, MapPinned } from "lucide-react";

import ValveMapClient from "@/components/map/valve-map-client";
import AddValveModal from "@/components/map/add-valve-modal";
import { cn } from "@/lib/utils";
import { EffectiveStatus, EFFECTIVE_STATUS_COLORS, EFFECTIVE_STATUS_NAME } from "@/lib/valve-effective-status";
import { Branch, ValveWithBranch } from "@/types";

const STATUS_LEGEND: EffectiveStatus[] = ["ใช้งาน", "ไม่ได้ใช้งาน", "ชำรุด"];

type Props = {
  valves: ValveWithBranch[];
  branches: Branch[];
};

export default function MapView({ valves, branches }: Props) {
  const [branchId, setBranchId] = useState<string | "all">("all");
  const [editMode, setEditMode] = useState(false);

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
            {STATUS_LEGEND.map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: EFFECTIVE_STATUS_COLORS[status] }}
                />
                {EFFECTIVE_STATUS_NAME[status]}
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

          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
              editMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            )}
          >
            <MapPinned className="h-4 w-4" strokeWidth={2.25} />
            {editMode ? "กำลังแก้ไขพิกัด" : "แก้ไขพิกัด"}
          </button>

          <AddValveModal branches={branches} />
        </div>
      </div>

      {editMode && (
        <div className="rounded-xl border border-primary/30 bg-primary-subtle px-4.5 py-3 text-[13px] font-medium text-primary">
          โหมดแก้ไขพิกัด: ลากหมุดบนแผนที่ไปยังตำแหน่งที่ถูกต้อง แล้วกด &ldquo;บันทึกตำแหน่งใหม่&rdquo; ในกล่องข้อมูลที่เปิดขึ้น
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div style={{ height: "70vh", minHeight: 480 }}>
          <ValveMapClient valves={filteredValves} editable={editMode} />
        </div>
      </div>
    </div>
  );
}
