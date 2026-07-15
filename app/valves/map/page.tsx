import { MapIcon } from "lucide-react";

import { getValves } from "@/lib/data/valves";
import ValveMapClient from "@/components/map/valve-map-client";

const STATUS_LEGEND = [
  { label: "ใช้งาน", color: "#0ca30c" },
  { label: "ไม่ได้ใช้งาน", color: "#d03b3b" },
  { label: "ไม่ระบุ", color: "#94a3b8" },
];

export default async function ValveMapPage() {
  const valves = await getValves();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <MapIcon className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              แผนที่จุดติดตั้งวาล์ว
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              เขต 10 · {valves.length} จุด
            </p>
          </div>
        </div>

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
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div style={{ height: "70vh", minHeight: 480 }}>
          <ValveMapClient valves={valves} />
        </div>
      </div>
    </div>
  );
}
