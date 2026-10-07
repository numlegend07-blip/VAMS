"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CalendarDays, Settings2, Plus } from "lucide-react";

import { Branch, PMRecord, ValveWithBranch } from "@/types";
import { cn } from "@/lib/utils";
import { EFFECTIVE_STATUS_BADGE, EFFECTIVE_STATUS_LABEL, getEffectiveStatus } from "@/lib/valve-effective-status";

import DetailSpecCard from "./detail-spec-card";
import ActionButtons from "./action-buttons";
import EditValveModal from "./edit-valve-modal";
import HealthCard from "./health-card";
import PMTimeline from "../pm/pm-timeline";
import PMForm from "../pm/pm-form";

type Props = {
  valve: ValveWithBranch;
  pmRecords: PMRecord[];
  branches: Branch[];
};

export default function ValveInfoCard({ valve, pmRecords, branches }: Props) {
  const [showPM, setShowPM] = useState(false);
  const [showPMForm, setShowPMForm] = useState(false);

  const effective = getEffectiveStatus(valve);
  const healthScore = effective === "ใช้งาน" ? 92 : effective === "ชำรุด" ? 25 : 55;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/valves"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          กลับไปหน้ารายการ
        </Link>

        <EditValveModal valve={valve} branches={branches} pmCount={pmRecords.length} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary sm:h-28 sm:w-28">
            <Settings2 className="h-11 w-11" strokeWidth={1.75} />
          </div>

          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
            </h1>

            <h2 className="mt-1 text-sm font-medium text-primary">
              {valve.brand} {valve.model ?? ""}
            </h2>

            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                EFFECTIVE_STATUS_BADGE[effective]
              )}
            >
              {EFFECTIVE_STATUS_LABEL[effective]}
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
            <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">เหตุผลที่ไม่ได้ใช้งาน: </span>
              {valve.inactive_reason}
            </div>
          )}

          {valve.remark && (
            <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">หมายเหตุ: </span>
              {valve.remark}
            </div>
          )}

          <div className="mt-6">
            <ActionButtons
              valveId={valve.id}
              hasCoordinates={valve.latitude != null && valve.longitude != null}
              hasPM={pmRecords.length > 0}
              imageUrl={valve.image_url}
              onPMClick={() => {
                setShowPM(true);
                requestAnimationFrame(() =>
                  document.getElementById("pm-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
                );
              }}
              pmActive={showPM}
            />
          </div>

          {showPM && (
            <div id="pm-section">
              <PMTimeline records={pmRecords} />

              {showPMForm ? (
                <PMForm valveId={valve.id} onDone={() => setShowPMForm(false)} />
              ) : (
                <button
                  onClick={() => setShowPMForm(true)}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.25} />
                  เพิ่มบันทึก PM
                </button>
              )}
            </div>
          )}
        </div>

        <HealthCard score={healthScore} />
      </div>
    </div>
  );
}
