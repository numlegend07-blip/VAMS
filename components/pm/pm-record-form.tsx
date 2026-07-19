"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings2,
  Gauge,
  FileText,
  ImagePlus,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
  Loader2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PM_TYPES } from "@/lib/pm-type";
import { STATUS_LABEL } from "@/lib/valve-status";
import CardHeader from "@/components/ui/card-header";
import { Profile, PMRecordWithValve, PMType, ValveStatus, ValveWithBranch } from "@/types";
import { PMStats } from "@/lib/data/pm-history";

const STATUSES: ValveStatus[] = ["ใช้งาน", "ไม่ได้ใช้งาน", "ไม่ระบุ"];

const NEXT_DUE_PRESETS = [
  { label: "30 วัน", days: 30 },
  { label: "60 วัน", days: 60 },
  { label: "90 วัน", days: 90 },
  { label: "180 วัน", days: 180 },
  { label: "1 ปี", days: 365 },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(baseStr: string, days: number) {
  const base = baseStr ? new Date(baseStr) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

type FormState = {
  assetCode: string;
  performedAt: string;
  pmType: PMType;
  statusAfter: ValveStatus;
  nextDueAt: string;
  nextDuePreset: string;
  pressureIn: string;
  pressureOut: string;
  setPointOriginal: string;
  setPointAdjusted: string;
  conditionFound: string;
  workPerformed: string;
  partsUsed: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    assetCode: "",
    performedAt: today(),
    pmType: PM_TYPES[0],
    statusAfter: "ใช้งาน",
    nextDueAt: addDays(today(), 30),
    nextDuePreset: "30",
    pressureIn: "",
    pressureOut: "",
    setPointOriginal: "",
    setPointAdjusted: "",
    conditionFound: "",
    workPerformed: "",
    partsUsed: "",
    notes: "",
  };
}

type Props = {
  valves: ValveWithBranch[];
  stats: PMStats;
  profile: Profile | null;
  latest: PMRecordWithValve | null;
};

export default function PMRecordForm({ valves, stats, profile, latest }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const matchedValve = valves.find((v) => v.asset_code === form.assetCode.trim()) ?? null;

  function clearForm() {
    setForm(emptyForm());
    setBeforeFile(null);
    setAfterFile(null);
    setError(null);
    setSuccess(false);
  }

  function applyPreset(days: string) {
    set("nextDuePreset", days);
    if (days) {
      set("nextDueAt", addDays(form.performedAt, Number(days)));
    }
  }

  async function uploadPhoto(valveId: string, file: File, label: "before" | "after") {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `pm/${valveId}/${crypto.randomUUID()}-${label}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("valve-images").upload(path, file);
    if (uploadError) {
      throw new Error(`อัปโหลดรูป${label === "before" ? "ก่อน" : "หลัง"}ไม่สำเร็จ: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("valve-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (!matchedValve) {
      setError("กรุณากรอกรหัสวาล์วที่มีอยู่ในระบบ");
      return;
    }
    if (!form.performedAt) {
      setError("กรุณาเลือกวันที่ตรวจสอบ");
      return;
    }
    if (!form.pressureIn.trim() || !form.pressureOut.trim()) {
      setError("กรุณากรอกความดันขาเข้าและขาออก");
      return;
    }

    setSubmitting(true);
    try {
      const [photoBeforeUrl, photoAfterUrl] = await Promise.all([
        beforeFile ? uploadPhoto(matchedValve.id, beforeFile, "before") : Promise.resolve(null),
        afterFile ? uploadPhoto(matchedValve.id, afterFile, "after") : Promise.resolve(null),
      ]);

      const supabase = createClient();

      const { data: inserted, error: insertError } = await supabase
        .from("pm_history")
        .insert({
          valve_id: matchedValve.id,
          performed_at: form.performedAt,
          title: form.pmType,
          pm_type: form.pmType,
          description: form.notes.trim() || null,
          pressure_in: form.pressureIn ? Number(form.pressureIn) : null,
          pressure_out: form.pressureOut ? Number(form.pressureOut) : null,
          set_point_original: form.setPointOriginal ? Number(form.setPointOriginal) : null,
          set_point_adjusted: form.setPointAdjusted ? Number(form.setPointAdjusted) : null,
          condition_found: form.conditionFound.trim() || null,
          work_performed: form.workPerformed.trim() || null,
          parts_used: form.partsUsed.trim() || null,
          next_due_at: form.nextDueAt || null,
          status_after: form.statusAfter,
          photo_before_url: photoBeforeUrl,
          photo_after_url: photoAfterUrl,
          created_by: profile?.id ?? null,
          created_by_name: profile?.full_name ?? null,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`บันทึกไม่สำเร็จ: ${insertError.message}`);
      }

      const { error: statusError } = await supabase
        .from("valves")
        .update({ status: form.statusAfter })
        .eq("id", matchedValve.id);

      if (statusError) {
        throw new Error(`บันทึก PM สำเร็จ แต่อัปเดตสถานะวาล์วไม่สำเร็จ: ${statusError.message}`);
      }

      if (inserted?.id) {
        fetch("/api/telegram/notify-pm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: inserted.id }),
        }).catch(() => {});
      }

      clearForm();
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-extrabold text-foreground">บันทึกข้อมูลการบำรุงรักษา</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            กรอกข้อมูลการตรวจสอบและซ่อมบำรุงคอนโทรลวาล์ว
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={clearForm}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.25} />
            ล้างฟอร์ม
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
              submitting && "opacity-70"
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.25} />}
            บันทึกข้อมูล
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-success-subtle px-3.5 py-2.5 text-sm text-success">
          บันทึกข้อมูลสำเร็จ
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={Settings2} title="ข้อมูลวาล์ว" subtitle="ข้อมูลพื้นฐาน" />
            <div className="grid grid-cols-1 gap-4 p-4.5 sm:grid-cols-2">
              <Field label="รหัสวาล์ว" required>
                <input
                  list="pm-valve-codes"
                  value={form.assetCode}
                  onChange={(e) => set("assetCode", e.target.value)}
                  placeholder="เช่น CV-001"
                  className={inputClass}
                />
                <datalist id="pm-valve-codes">
                  {valves
                    .filter((v) => v.asset_code)
                    .map((v) => (
                      <option key={v.id} value={v.asset_code!} />
                    ))}
                </datalist>
                {form.assetCode.trim() && !matchedValve && (
                  <p className="mt-1 text-[11px] text-warning">ไม่พบรหัสวาล์วนี้ในระบบ</p>
                )}
              </Field>

              <Field label="วันที่ตรวจสอบ" required>
                <input
                  type="date"
                  value={form.performedAt}
                  onChange={(e) => set("performedAt", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="ชื่อจุดติดตั้ง" required>
                <div className={cn(inputClass, "bg-surface-muted text-muted-foreground")}>
                  {matchedValve?.location ?? "-- กรอกรหัสวาล์วก่อน --"}
                </div>
              </Field>

              <Field label="สาขา" required>
                <div className={cn(inputClass, "bg-surface-muted text-muted-foreground")}>
                  {matchedValve?.branch.name ?? "-- กรอกรหัสวาล์วก่อน --"}
                </div>
              </Field>

              <Field label="ผู้ตรวจสอบ" required tag="✓ Auto" tagClassName="bg-success-subtle text-success">
                <div className={cn(inputClass, "bg-surface-muted text-muted-foreground")}>
                  {profile?.full_name ?? "-"}
                </div>
              </Field>

              <Field label="ประเภทงาน">
                <select value={form.pmType} onChange={(e) => set("pmType", e.target.value as PMType)} className={inputClass}>
                  {PM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="สถานะวาล์วหลังการตรวจ" required>
                <select
                  value={form.statusAfter}
                  onChange={(e) => set("statusAfter", e.target.value as ValveStatus)}
                  className={inputClass}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="กำหนดบำรุงครั้งต่อไป">
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={form.nextDueAt}
                    onChange={(e) => set("nextDueAt", e.target.value)}
                    className={cn(inputClass, "flex-1")}
                  />
                  <select
                    value={form.nextDuePreset}
                    onChange={(e) => applyPreset(e.target.value)}
                    className="w-27 shrink-0 rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
                  >
                    <option value="">เลือก</option>
                    {NEXT_DUE_PRESETS.map((p) => (
                      <option key={p.days} value={p.days}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-[10.5px] text-muted-foreground">
                  คำนวณจากวันที่ตรวจสอบโดยอัตโนมัติ (ค่าเริ่มต้น 30 วัน)
                </p>
              </Field>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={Gauge} color="warning" title="ค่าความดัน" subtitle="Inlet / Outlet Pressure Reading" />
            <div className="grid grid-cols-1 gap-4 p-4.5 sm:grid-cols-2">
              <Field label="ความดันขาเข้า (Inlet)" required>
                <UnitInput value={form.pressureIn} onChange={(v) => set("pressureIn", v)} />
              </Field>
              <Field label="ความดันขาออก (Outlet)" required>
                <UnitInput value={form.pressureOut} onChange={(v) => set("pressureOut", v)} />
              </Field>
              <Field label="ค่าตั้งเดิม (Set Point)">
                <UnitInput value={form.setPointOriginal} onChange={(v) => set("setPointOriginal", v)} />
              </Field>
              <Field label="ค่าตั้งใหม่ (Adjusted)">
                <UnitInput value={form.setPointAdjusted} onChange={(v) => set("setPointAdjusted", v)} />
              </Field>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={FileText} color="success" title="รายละเอียดการปฏิบัติงาน" />
            <div className="grid grid-cols-1 gap-4 p-4.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="สภาพวาล์วที่พบ">
                  <textarea
                    value={form.conditionFound}
                    onChange={(e) => set("conditionFound", e.target.value)}
                    rows={3}
                    placeholder="อธิบายสภาพวาล์วที่พบ เช่น มีรอยรั่ว, สนิม, Diaphragm เสื่อมสภาพ..."
                    className={cn(inputClass, "resize-none")}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="งานที่ดำเนินการ">
                  <textarea
                    value={form.workPerformed}
                    onChange={(e) => set("workPerformed", e.target.value)}
                    rows={3}
                    placeholder="รายละเอียดงานซ่อมบำรุงที่ดำเนินการ..."
                    className={cn(inputClass, "resize-none")}
                  />
                </Field>
              </div>
              <Field label="อะไหล่ที่ใช้">
                <input
                  value={form.partsUsed}
                  onChange={(e) => set("partsUsed", e.target.value)}
                  placeholder="เช่น Diaphragm, O-ring, Spring"
                  className={inputClass}
                />
              </Field>
              <Field label="หมายเหตุ">
                <input
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={ImagePlus} color="purple" title="รูปภาพประกอบ" subtitle="ภาพก่อน / หลัง การบำรุงรักษา" />
            <div className="grid grid-cols-1 gap-4.5 p-4.5 sm:grid-cols-2">
              <PhotoPicker
                label="ก่อนดำเนินการ (Before)"
                labelClassName="text-warning"
                file={beforeFile}
                onChange={setBeforeFile}
                inputRef={beforeInputRef}
              />
              <PhotoPicker
                label="หลังดำเนินการ (After)"
                labelClassName="text-success"
                file={afterFile}
                onChange={setAfterFile}
                inputRef={afterInputRef}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={Monitor} title="สรุปข้อมูล" />
            <div className="grid grid-cols-2 gap-2.5 p-3.5">
              <StatTile value={stats.total} label="บันทึกทั้งหมด" color="text-primary" />
              <StatTile value={stats.month} label="เดือนนี้" color="text-warning" />
              <StatTile value={stats.valveTotal} label="วาล์วในระบบ" color="text-success" />
              <StatTile value={stats.broken} label="ชำรุด" color="text-danger" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={AlertTriangle} color="danger" title="แจ้งเตือน" subtitle="ไม่มีการแจ้งเตือน" />
            <div className="p-3.5">
              <p className="py-2.5 text-center text-xs text-muted-foreground">ไม่มีรายการ</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <CardHeader icon={CheckCircle2} color="success" title="บันทึกล่าสุด" />
            {latest ? (
              <div className="p-3.5">
                <div className="text-xs font-bold text-foreground">
                  {latest.valve.asset_code ?? latest.valve_id.slice(0, 8).toUpperCase()}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {latest.valve.branch.name} · {latest.pm_type}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{latest.performed_at}</div>
              </div>
            ) : (
              <p className="p-4 text-center text-xs text-muted-foreground">ยังไม่มีบันทึก</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle";

function Field({
  label,
  required,
  tag,
  tagClassName,
  children,
}: {
  label: string;
  required?: boolean;
  tag?: string;
  tagClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-warning">*</span>}
        {tag && (
          <span className={cn("rounded-full px-2 py-0.5 text-[9.5px] font-bold", tagClassName)}>{tag}</span>
        )}
      </span>
      {children}
    </label>
  );
}

function UnitInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className={cn(inputClass, "pr-11")}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
        Bar
      </span>
    </div>
  );
}

function StatTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 text-center">
      <div className={cn("font-display text-[26px] font-extrabold leading-none", color)}>{value}</div>
      <div className="mt-1 text-[10.5px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

function PhotoPicker({
  label,
  labelClassName,
  file,
  onChange,
  inputRef,
}: {
  label: string;
  labelClassName?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div>
      <span className={cn("mb-1.5 block text-xs font-bold", labelClassName)}>{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
          <span className="text-xs">คลิกหรือลากไฟล์มาวางที่นี่</span>
          <span className="text-[10.5px]">รองรับ JPG, PNG, HEIC (ไม่เกิน 10MB)</span>
        </button>
      )}
    </div>
  );
}
