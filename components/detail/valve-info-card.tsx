"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CalendarDays, Settings2, Plus } from "lucide-react";

import { PMRecord, ValveWithBranch } from "@/types";
import { cn } from "@/lib/utils";

import DetailSpecCard from "./detail-spec-card";
import ActionButtons from "./action-buttons";
import HealthCard from "./health-card";
import PMTimeline from "../pm/pm-timeline";
import PMForm from "../pm/pm-form";

type Props = {
  valve: ValveWithBranch;
  pmRecords: PMRecord[];
};

export default function ValveInfoCard({ valve, pmRecords }: Props) {
  const [showPM, setShowPM] = useState(false);
  const [showPMForm, setShowPMForm] = useState(false);

  const active = valve.status === "ใช้งาน";
  const healthScore = active ? 92 : valve.status === "ไม่ระบุ" ? 60 : 40;

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
              {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
            </h1>

            <h2 className="mt-1 text-sm font-medium text-primary">
              {valve.brand} {valve.model ?? ""}
            </h2>

            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                active
                  ? "bg-success-subtle text-success"
                  : valve.status === "ไม่ระบุ"
                    ? "bg-neutral-subtle text-neutral"
                    : "bg-danger-subtle text-danger"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-success" : valve.status === "ไม่ระบุ" ? "bg-neutral" : "bg-danger"
                )}
              />
              {valve.status}
            </span>

            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" strokeWidth={2.25} />
                {valve.location ?? "ไม่ระบุตำแหน่ง"}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" strokeWidth={2.25} />
                {valve.branch.name}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
                ปีติดตั้ง {valve.install_year_be ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailSpecCard title="Pressure In" value={valve.pressure_in != null ? `${valve.pressure_in} bar` : "-"} />
            <DetailSpecCard title="Pressure Out" value={valve.pressure_out != null ? `${valve.pressure_out} bar` : "-"} />
            <DetailSpecCard title="Flow Rate" value={valve.flow_rate != null ? `${valve.flow_rate}` : "-"} />
            <DetailSpecCard title="Asset Code" value={valve.asset_code ?? "-"} />
            <DetailSpecCard title="Valve Size" value={valve.size_mm != null ? `${valve.size_mm} mm` : "-"} />
            <DetailSpecCard title="Valve Type" value={valve.valve_type} />
          </div>

          {valve.status !== "ใช้งาน" && valve.inactive_reason && (
            <div className="mt-4 rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">เหตุผลที่ไม่ได้ใช้งาน: </span>
              {valve.inactive_reason}
            </div>
          )}

          {valve.remark && (
            <div className="mt-4 rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">หมายเหตุ: </span>
              {valve.remark}
            </div>
          )}

          <div className="mt-6">
            <ActionButtons onPMClick={() => setShowPM((v) => !v)} pmActive={showPM} />
          </div>

          {showPM && (
            <>
              <PMTimeline records={pmRecords} />

              {showPMForm ? (
                <PMForm valveId={valve.id} onDone={() => setShowPMForm(false)} />
              ) : (
                <button
                  onClick={() => setShowPMForm(true)}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.25} />
                  เพิ่มบันทึก PM
                </button>
              )}
            </>
          )}
        </div>

        <HealthCard score={healthScore} />
      </div>
    </div>
  );
}
