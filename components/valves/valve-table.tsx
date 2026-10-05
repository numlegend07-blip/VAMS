import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ValveWithBranch, Valve } from "@/types";
import { cn } from "@/lib/utils";
import { EFFECTIVE_STATUS_BADGE, EFFECTIVE_STATUS_LABEL, getEffectiveStatus } from "@/lib/valve-effective-status";

type ValveTableProps = {
  valves: ValveWithBranch[];
};

export default function ValveTable({ valves }: ValveTableProps) {
  if (valves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
        <p className="text-sm font-medium text-foreground">ไม่พบข้อมูลวาล์ว</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ลองค้นหาด้วยคำอื่น เช่น สาขา ยี่ห้อ หรือรหัสพัสดุ
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">รหัส</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">สาขา</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">ชนิด</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">ยี่ห้อ</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">ขนาด</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">สถานะ</th>
            <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">เหตุผล</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {valves.map((valve) => (
            <tr key={valve.id} className="group transition-colors hover:bg-surface-muted">
              <td className="p-0">
                <Link
                  href={`/valves/${valve.id}`}
                  className="flex items-center px-4 py-3 font-mono text-xs font-medium text-foreground"
                >
                  {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
                </Link>
              </td>
              <td className="px-4 py-3 text-foreground">{valve.branch.name}</td>
              <td className="px-4 py-3 text-foreground">{valve.valve_type}</td>
              <td className="px-4 py-3 text-foreground">{valve.brand}</td>
              <td className="px-4 py-3 text-foreground">
                {valve.size_mm ? `${valve.size_mm} มม.` : "-"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge valve={valve} />
              </td>
              <td className="max-w-50 truncate px-4 py-3 text-muted-foreground" title={valve.inactive_reason ?? undefined}>
                {valve.inactive_reason || "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/valves/${valve.id}`}>
                  <ChevronRight
                    className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    strokeWidth={2.25}
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ valve }: { valve: Pick<Valve, "status" | "inactive_reason"> }) {
  const effective = getEffectiveStatus(valve);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        EFFECTIVE_STATUS_BADGE[effective]
      )}
    >
      {EFFECTIVE_STATUS_LABEL[effective]}
    </span>
  );
}
