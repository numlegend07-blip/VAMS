import { Gauge, CircleCheck, CircleX, ClipboardCheck } from "lucide-react";

import { controlValves } from "@/data/control-valves";

export default function DashboardCards() {
  const total = controlValves.length;

  const active = controlValves.filter(
    (v) => v.status === "ใช้งาน"
  ).length;

  const inactive = total - active;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="จำนวนวาล์ว"
        value={String(total)}
        icon={Gauge}
        tone="text-primary bg-primary-subtle"
      />

      <Card
        title="ใช้งาน"
        value={String(active)}
        icon={CircleCheck}
        tone="text-success bg-success-subtle"
      />

      <Card
        title="ไม่ได้ใช้งาน"
        value={String(inactive)}
        icon={CircleX}
        tone="text-danger bg-danger-subtle"
      />

      <Card
        title="PM สำเร็จ"
        value="100%"
        icon={ClipboardCheck}
        tone="text-warning bg-warning-subtle"
      />
    </div>
  );
}

function Card({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </div>

      <div className="mt-4 text-sm text-muted-foreground">{title}</div>

      <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}
