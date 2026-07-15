import { MapPin, CircleCheck, CircleX, Wrench, TrendingUp } from "lucide-react";

import { controlValves } from "@/data/control-valves";

export default function ExecutiveSummary() {
  const total = controlValves.length;

  const active = controlValves.filter(
    (v) => v.status === "ใช้งาน"
  ).length;

  const inactive = total - active;

  const rows = [
    {
      icon: MapPin,
      label: "วาล์วทั้งหมด",
      value: `${total} ตัว`,
      tone: "text-primary bg-primary-subtle",
    },
    {
      icon: CircleCheck,
      label: "ใช้งานปกติ",
      value: `${active} ตัว`,
      tone: "text-success bg-success-subtle",
    },
    {
      icon: CircleX,
      label: "ไม่พร้อมใช้งาน",
      value: `${inactive} ตัว`,
      tone: "text-danger bg-danger-subtle",
    },
    {
      icon: Wrench,
      label: "ระบบ PM พร้อมใช้งาน",
      value: "100%",
      tone: "text-primary bg-primary-subtle",
    },
    {
      icon: TrendingUp,
      label: "ข้อมูลอัปเดต",
      value: "Real-time",
      tone: "text-primary bg-primary-subtle",
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <h2 className="text-base font-semibold text-foreground">
        Executive Summary
      </h2>

      <div className="mt-4 flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-3 text-sm text-muted-foreground">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${row.tone}`}
              >
                <row.icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              {row.label}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
