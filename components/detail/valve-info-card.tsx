"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CalendarDays, Settings2 } from "lucide-react";

import { ControlValve } from "@/types";
import { cn } from "@/lib/utils";

import DetailSpecCard from "./detail-spec-card";
import ActionButtons from "./action-buttons";
import HealthCard from "./health-card";
import PMTimeline from "../pm/pm-timeline";

type Props = {
  valve: ControlValve;
};

export default function ValveInfoCard({ valve }: Props) {
  const [showPM, setShowPM] = useState(false);

  const active = valve.status === "ใช้งาน";
  const healthScore = active ? 92 : 40;

  return (
    <div>
      <Link
        href="/valves"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        กลับไปหน้ารายการ
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary sm:h-28 sm:w-28">
            <Settings2 className="h-11 w-11" strokeWidth={1.75} />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {valve.id}
            </h1>

            <h2 className="mt-1 text-sm font-medium text-primary">
              {valve.brand} {valve.model}
            </h2>

            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-success" : "bg-danger")} />
              {valve.status}
            </span>

            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" strokeWidth={2.25} />
                {valve.location}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" strokeWidth={2.25} />
                {valve.branch}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
                ปีติดตั้ง {valve.installYear ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailSpecCard title="Pressure In" value={`${valve.pressureIn ?? "-"} bar`} />
            <DetailSpecCard title="Pressure Out" value={`${valve.pressureOut ?? "-"} bar`} />
            <DetailSpecCard title="Flow Rate" value={`${valve.flowRate ?? "-"}`} />
            <DetailSpecCard title="Asset Code" value={valve.assetCode ?? "-"} />
            <DetailSpecCard title="Valve Size" value={`${valve.size} mm`} />
            <DetailSpecCard title="Valve Type" value={valve.valveType} />
          </div>

          <div className="mt-6">
            <ActionButtons onPMClick={() => setShowPM((v) => !v)} pmActive={showPM} />
          </div>

          {showPM && <PMTimeline />}
        </div>

        <HealthCard score={healthScore} />
      </div>
    </div>
  );
}
