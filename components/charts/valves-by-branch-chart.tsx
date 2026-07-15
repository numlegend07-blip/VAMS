"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ValveWithBranch } from "@/types";

type Props = {
  valves: ValveWithBranch[];
  selectedBranchId: string | null;
  onSelectBranch: (branchId: string | null) => void;
};

export default function ValvesByBranchChart({ valves, selectedBranchId, onSelectBranch }: Props) {
  const countByBranch = new Map<string, { branchId: string; name: string; count: number }>();

  for (const valve of valves) {
    const key = valve.branch.id;
    const existing = countByBranch.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      countByBranch.set(key, { branchId: key, name: valve.branch.name, count: 1 });
    }
  }

  const data = [...countByBranch.values()].sort((a, b) => b.count - a.count);

  const rowHeight = 26;
  const chartHeight = Math.max(data.length * rowHeight, 200);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          จำนวนวาล์วแยกตามสาขา
        </h2>
        {selectedBranchId && (
          <button
            onClick={() => onSelectBranch(null)}
            className="text-xs font-medium text-primary hover:underline"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">คลิกที่แท่งกราฟเพื่อกรองข้อมูลตามสาขา</p>

      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--foreground)",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value) => [`${value} ตัว`, "จำนวนวาล์ว"]}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              maxBarSize={18}
              isAnimationActive={false}
              label={{ position: "right", fill: "#64748b", fontSize: 12 }}
              onClick={(entry) => {
                const branchId = (entry.payload as { branchId: string }).branchId;
                onSelectBranch(branchId === selectedBranchId ? null : branchId);
              }}
              cursor="pointer"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.branchId}
                  fill={
                    !selectedBranchId || selectedBranchId === entry.branchId
                      ? "#2563eb"
                      : "#bfdbfe"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
