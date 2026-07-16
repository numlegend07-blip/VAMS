import { Gauge, CircleCheck, CircleX, HelpCircle } from "lucide-react";

import { ValveWithBranch } from "@/types";

type Props = {
  valves: ValveWithBranch[];
};

export default function DashboardCards({ valves }: Props) {
  const total = valves.length;

  const active = valves.filter((v) => v.status === "ใช้งาน").length;
  const inactive = valves.filter((v) => v.status === "ไม่ได้ใช้งาน").length;
  const unknown = valves.filter((v) => v.status === "ไม่ระบุ").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <Card title="จำนวนวาล์ว" value={String(total)} sub="ทั้งหมดในเขต 10" icon={Gauge} color="primary" />

      <Card
        title="ใช้งาน"
        value={String(active)}
        sub={`${pct(active)}% ของทั้งหมด`}
        icon={CircleCheck}
        color="success"
      />

      <Card
        title="ไม่ได้ใช้งาน"
        value={String(inactive)}
        sub={`${pct(inactive)}% ของทั้งหมด`}
        icon={CircleX}
        color="danger"
      />

      <Card
        title="ไม่ระบุสถานะ"
        value={String(unknown)}
        sub={`${pct(unknown)}% ของทั้งหมด`}
        icon={HelpCircle}
        color="purple"
      />
    </div>
  );
}

const COLOR_STYLES = {
  primary: { text: "text-primary", badge: "bg-primary-subtle text-primary", blob: "bg-primary/7" },
  success: { text: "text-success", badge: "bg-success-subtle text-success", blob: "bg-success/7" },
  danger: { text: "text-danger", badge: "bg-danger-subtle text-danger", blob: "bg-danger/7" },
  purple: { text: "text-purple", badge: "bg-purple-subtle text-purple", blob: "bg-purple/7" },
} as const;

function Card({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: keyof typeof COLOR_STYLES;
}) {
  const s = COLOR_STYLES[color];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`pointer-events-none absolute -right-5 -top-5 h-22.5 w-22.5 rounded-full ${s.blob}`}
      />

      <span className={`absolute right-3.5 top-3.5 flex h-9.5 w-9.5 items-center justify-center rounded-lg ${s.badge}`}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>

      <div className="relative">
        <div className="text-[11px] font-bold tracking-wide text-muted-foreground">{title}</div>
        <div className={`font-display mt-1.5 text-[34px] font-extrabold leading-none ${s.text}`}>
          {value}
        </div>
        <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
