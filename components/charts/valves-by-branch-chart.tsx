"use client";

import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Branch, ValveWithBranch } from "@/types";
import { STATUS_COLORS, STATUS_NAME } from "@/lib/valve-status";
import CardHeader from "@/components/ui/card-header";

type Props = {
  valves: ValveWithBranch[];
  branches: Branch[];
  onSelectBranch: (branchId: string | null) => void;
};

export default function ValvesByBranchChart({ valves, branches, onSelectBranch }: Props) {
  const data = branches.map((branch) => {
    const branchValves = valves.filter((v) => v.branch_id === branch.id);
    return {
      branchId: branch.id,
      name: branch.name,
      ใช้งาน: branchValves.filter((v) => v.status === "ใช้งาน").length,
      ไม่ได้ใช้งาน: branchValves.filter((v) => v.status === "ไม่ได้ใช้งาน").length,
      ไม่ระบุ: branchValves.filter((v) => v.status === "ไม่ระบุ").length,
    };
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <CardHeader
        icon={BarChart3}
        title={`ข้อมูลแยกรายสาขา (${branches.length} สาขา)`}
        action={
          <div className="hidden items-center gap-3.5 text-xs text-muted-foreground sm:flex">
            {(Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[key] }}
                />
                {STATUS_NAME[key]}
              </span>
            ))}
          </div>
        }
      />

      <div className="p-4.5" style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 60, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-55}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--foreground)",
                boxShadow: "var(--shadow-md)",
              }}
            />
            <Bar
              dataKey="ใช้งาน"
              name={STATUS_NAME["ใช้งาน"]}
              stackId="status"
              fill={STATUS_COLORS["ใช้งาน"]}
              isAnimationActive={false}
              onClick={(entry) =>
                onSelectBranch((entry.payload as { branchId: string }).branchId)
              }
              cursor="pointer"
            />
            <Bar
              dataKey="ไม่ได้ใช้งาน"
              name={STATUS_NAME["ไม่ได้ใช้งาน"]}
              stackId="status"
              fill={STATUS_COLORS["ไม่ได้ใช้งาน"]}
              isAnimationActive={false}
              onClick={(entry) =>
                onSelectBranch((entry.payload as { branchId: string }).branchId)
              }
              cursor="pointer"
            />
            <Bar
              dataKey="ไม่ระบุ"
              name={STATUS_NAME["ไม่ระบุ"]}
              stackId="status"
              fill={STATUS_COLORS["ไม่ระบุ"]}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
              onClick={(entry) =>
                onSelectBranch((entry.payload as { branchId: string }).branchId)
              }
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
