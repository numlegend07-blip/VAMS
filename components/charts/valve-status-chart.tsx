"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ValveWithBranch } from "@/types";
import CardHeader from "@/components/ui/card-header";

const STATUS_COLORS: Record<string, string> = {
  ใช้งาน: "#10b981",
  ไม่ได้ใช้งาน: "#ef4444",
  ไม่ระบุ: "#8b5cf6",
};

type Props = {
  valves: ValveWithBranch[];
};

export default function ValveStatusChart({ valves }: Props) {
  const counts = {
    ใช้งาน: valves.filter((v) => v.status === "ใช้งาน").length,
    ไม่ได้ใช้งาน: valves.filter((v) => v.status === "ไม่ได้ใช้งาน").length,
    ไม่ระบุ: valves.filter((v) => v.status === "ไม่ระบุ").length,
  };

  const total = valves.length;

  const data = (Object.keys(counts) as Array<keyof typeof counts>)
    .map((name) => ({ name, value: counts[name] }))
    .filter((entry) => entry.value > 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <CardHeader icon={PieChartIcon} color="warning" title="สัดส่วนสถานะวาล์ว" />

      <div className="relative flex-1 p-4.5" style={{ minHeight: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--foreground)",
                boxShadow: "var(--shadow-md)",
              }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(value, name) => [`${value} ตัว`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">วาล์วทั้งหมด</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4.5 pb-4.5 text-xs">
        {data.map((entry) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: STATUS_COLORS[entry.name] }}
            />
            {entry.name}
            <span className="font-semibold text-foreground">{entry.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
