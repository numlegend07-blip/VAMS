"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { controlValves } from "@/data/control-valves";

const STATUS_COLORS: Record<string, string> = {
  ใช้งาน: "#0ca30c",
  ไม่ได้ใช้งาน: "#d03b3b",
};

export default function ValveStatusChart() {
  const useCount = controlValves.filter(
    (v) => v.status === "ใช้งาน"
  ).length;

  const stopCount = controlValves.filter(
    (v) => v.status !== "ใช้งาน"
  ).length;

  const total = useCount + stopCount;

  const data = [
    { name: "ใช้งาน", value: useCount },
    { name: "ไม่ได้ใช้งาน", value: stopCount },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <h2 className="text-base font-semibold text-foreground">
        สถานะวาล์ว
      </h2>

      <div className="relative mt-2 flex-1" style={{ minHeight: 220 }}>
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
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">วาล์วทั้งหมด</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-5 text-xs">
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
