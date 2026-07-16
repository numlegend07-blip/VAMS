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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="จำนวนวาล์ว"
        value={String(total)}
        sub="ทั้งหมดในเขต 10"
        icon={Gauge}
        color="primary"
      />

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
        color="neutral"
      />
    </div>
  );
}

const COLOR_STYLES = {
  primary: {
    wash: "from-primary/15 via-primary/5 to-transparent",
    badge: "bg-primary text-primary-foreground shadow-primary/30",
    glow: "bg-primary/20",
    ring: "group-hover:ring-primary/25",
  },
  success: {
    wash: "from-success/15 via-success/5 to-transparent",
    badge: "bg-success text-white shadow-success/30",
    glow: "bg-success/20",
    ring: "group-hover:ring-success/25",
  },
  danger: {
    wash: "from-danger/15 via-danger/5 to-transparent",
    badge: "bg-danger text-white shadow-danger/30",
    glow: "bg-danger/20",
    ring: "group-hover:ring-danger/25",
  },
  neutral: {
    wash: "from-neutral/15 via-neutral/5 to-transparent",
    badge: "bg-neutral text-white shadow-neutral/30",
    glow: "bg-neutral/20",
    ring: "group-hover:ring-neutral/25",
  },
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
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-lg ${s.ring}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${s.wash}`} />
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${s.glow}`} />

      <div className="relative">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${s.badge}`}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>

        <div className="mt-4 text-sm font-medium text-muted-foreground">{title}</div>

        <div className="mt-1 text-4xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>

        <div className="mt-1.5 text-xs font-medium text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
