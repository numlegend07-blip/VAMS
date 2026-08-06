"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Pencil, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatThaiDate } from "@/lib/format";
import { PM_TYPE_STYLES, PM_TYPES } from "@/lib/pm-type";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/valve-status";
import { PMRecordWithValve, PMType, ValveStatus } from "@/types";

const STATUSES: ValveStatus[] = ["ใช้งาน", "ไม่ได้ใช้งาน", "ไม่ระบุ"];

type FormState = {
  performedAt: string;
  pmType: PMType;
  statusAfter: ValveStatus;
  nextDueAt: string;
  pressureIn: string;
  pressureOut: string;
  setPointOriginal: string;
  setPointAdjusted: string;
  conditionFound: string;
  workPerformed: string;
  partsUsed: string;
  notes: string;
};

function toFormState(record: PMRecordWithValve): FormState {
  return {
    performedAt: record.performed_at?.slice(0, 10) ?? "",
    pmType: record.pm_type,
    statusAfter: record.status_after ?? "ใช้งาน",
    nextDueAt: record.next_due_at?.slice(0, 10) ?? "",
    pressureIn: record.pressure_in != null ? String(record.pressure_in) : "",
    pressureOut: record.pressure_out != null ? String(record.pressure_out) : "",
    setPointOriginal: record.set_point_original != null ? String(record.set_point_original) : "",
    setPointAdjusted: record.set_point_adjusted != null ? String(record.set_point_adjusted) : "",
    conditionFound: record.condition_found ?? "",
    workPerformed: record.work_performed ?? "",
    partsUsed: record.parts_used ?? "",
    notes: record.description ?? "",
  };
}

type Props = {
  record: PMRecordWithValve;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onSaved: (record: PMRecordWithValve) => void;
};

export default function PMRecordModal({ record, initialMode = "view", onClose, onSaved }: Props) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [form, setForm] = useState<FormState>(() => toFormState(record));
  const [beforeUrl, setBeforeUrl] = useState(record.photo_before_url);
  const [afterUrl, setAfterUrl] = useState(record.photo_after_url);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit() {
    setForm(toFormState(record));
    setBeforeUrl(record.photo_before_url);
    setAfterUrl(record.photo_after_url);
    setBeforeFile(null);
    setAfterFile(null);
    setError(null);
    setMode("edit");
  }

  function cancelEdit() {
    setForm(toFormState(record));
    setBeforeUrl(record.photo_before_url);
    setAfterUrl(record.photo_after_url);
    setBeforeFile(null);
    setAfterFile(null);
    setError(null);
    setMode("view");
  }

  async function uploadPhoto(file: File, label: "before" | "after") {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `pm/${record.valve_id}/${crypto.randomUUID()}-${label}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("valve-images").upload(path, file);
    if (uploadError) {
      throw new Error(`อัปโหลดรูป${label === "before" ? "ก่อน" : "หลัง"}ไม่สำเร็จ: ${uploadError.message}`);
    }

    return supabase.storage.from("valve-images").getPublicUrl(path).data.publicUrl;
  }

  async function handleSave() {
    setError(null);

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
      const [newBeforeUrl, newAfterUrl] = await Promise.all([
        beforeFile ? uploadPhoto(beforeFile, "before") : Promise.resolve(beforeUrl),
        afterFile ? uploadPhoto(afterFile, "after") : Promise.resolve(afterUrl),
      ]);

      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("pm_history")
        .update({
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
          photo_before_url: newBeforeUrl,
          photo_after_url: newAfterUrl,
        })
        .eq("id", record.id)
        .select("*, valve:valves(id, asset_code, location, branch_id, status, branch:branches(id, name))")
        .single();

      if (updateError) {
        throw new Error(`บันทึกไม่สำเร็จ: ${updateError.message}`);
      }

      onSaved(data as unknown as PMRecordWithValve);
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 isolate flex items-center justify-center bg-black/55 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              {record.valve.asset_code ?? record.valve_id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {record.valve.location ?? "-"} · {record.valve.branch.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mode === "view" && (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
                แก้ไข
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <Section title="ข้อมูลการตรวจสอบ">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="วันที่ตรวจสอบ" required>
                {mode === "edit" ? (
                  <input
                    type="date"
                    value={form.performedAt}
                    onChange={(e) => set("performedAt", e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <ViewValue>{formatThaiDate(record.performed_at)}</ViewValue>
                )}
              </Field>

              <Field label="ประเภทงาน">
                {mode === "edit" ? (
                  <select value={form.pmType} onChange={(e) => set("pmType", e.target.value as PMType)} className={inputClass}>
                    {PM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={cn("inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium", PM_TYPE_STYLES[record.pm_type])}>
                    {record.pm_type}
                  </span>
                )}
              </Field>

              <Field label="สถานะวาล์วหลังการตรวจ" required>
                {mode === "edit" ? (
                  <select
                    value={form.statusAfter}
                    onChange={(e) => set("statusAfter", e.target.value as ValveStatus)}
                    className={inputClass}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                ) : (
                  record.status_after && (
                    <span className={cn("inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE[record.status_after])}>
                      {STATUS_LABEL[record.status_after]}
                    </span>
                  )
                )}
              </Field>

              <Field label="กำหนดบำรุงครั้งต่อไป">
                {mode === "edit" ? (
                  <input
                    type="date"
                    value={form.nextDueAt}
                    onChange={(e) => set("nextDueAt", e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <ViewValue>{record.next_due_at ? formatThaiDate(record.next_due_at) : "-"}</ViewValue>
                )}
              </Field>
            </div>
          </Section>

          <Section title="ค่าความดัน">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ความดันขาเข้า (Inlet)" required>
                {mode === "edit" ? (
                  <UnitInput value={form.pressureIn} onChange={(v) => set("pressureIn", v)} />
                ) : (
                  <ViewValue>{record.pressure_in != null ? `${record.pressure_in} bar` : "-"}</ViewValue>
                )}
              </Field>
              <Field label="ความดันขาออก (Outlet)" required>
                {mode === "edit" ? (
                  <UnitInput value={form.pressureOut} onChange={(v) => set("pressureOut", v)} />
                ) : (
                  <ViewValue>{record.pressure_out != null ? `${record.pressure_out} bar` : "-"}</ViewValue>
                )}
              </Field>
              <Field label="ค่าตั้งเดิม (Set Point)">
                {mode === "edit" ? (
                  <UnitInput value={form.setPointOriginal} onChange={(v) => set("setPointOriginal", v)} />
                ) : (
                  <ViewValue>{record.set_point_original != null ? `${record.set_point_original} bar` : "-"}</ViewValue>
                )}
              </Field>
              <Field label="ค่าตั้งใหม่ (Adjusted)">
                {mode === "edit" ? (
                  <UnitInput value={form.setPointAdjusted} onChange={(v) => set("setPointAdjusted", v)} />
                ) : (
                  <ViewValue>{record.set_point_adjusted != null ? `${record.set_point_adjusted} bar` : "-"}</ViewValue>
                )}
              </Field>
            </div>
          </Section>

          <Section title="รายละเอียดการปฏิบัติงาน">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="สภาพวาล์วที่พบ">
                  {mode === "edit" ? (
                    <textarea
                      value={form.conditionFound}
                      onChange={(e) => set("conditionFound", e.target.value)}
                      rows={3}
                      className={cn(inputClass, "resize-none")}
                    />
                  ) : (
                    <ViewValue>{record.condition_found || "-"}</ViewValue>
                  )}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="งานที่ดำเนินการ">
                  {mode === "edit" ? (
                    <textarea
                      value={form.workPerformed}
                      onChange={(e) => set("workPerformed", e.target.value)}
                      rows={3}
                      className={cn(inputClass, "resize-none")}
                    />
                  ) : (
                    <ViewValue>{record.work_performed || "-"}</ViewValue>
                  )}
                </Field>
              </div>
              <Field label="อะไหล่ที่ใช้">
                {mode === "edit" ? (
                  <input value={form.partsUsed} onChange={(e) => set("partsUsed", e.target.value)} className={inputClass} />
                ) : (
                  <ViewValue>{record.parts_used || "-"}</ViewValue>
                )}
              </Field>
              <Field label="หมายเหตุ">
                {mode === "edit" ? (
                  <input value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass} />
                ) : (
                  <ViewValue>{record.description || "-"}</ViewValue>
                )}
              </Field>
              <Field label="ผู้ตรวจสอบ">
                <ViewValue>{record.created_by_name ?? "-"}</ViewValue>
              </Field>
            </div>
          </Section>

          <Section title="รูปภาพประกอบ" last>
            <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              <PhotoField
                label="ก่อนดำเนินการ (Before)"
                labelClassName="text-warning"
                url={beforeUrl}
                file={beforeFile}
                editable={mode === "edit"}
                inputRef={beforeInputRef}
                onPick={(file) => {
                  setBeforeFile(file);
                  if (file) setBeforeUrl(null);
                }}
                onRemove={() => {
                  setBeforeFile(null);
                  setBeforeUrl(null);
                }}
              />
              <PhotoField
                label="หลังดำเนินการ (After)"
                labelClassName="text-success"
                url={afterUrl}
                file={afterFile}
                editable={mode === "edit"}
                inputRef={afterInputRef}
                onPick={(file) => {
                  setAfterFile(file);
                  if (file) setAfterUrl(null);
                }}
                onRemove={() => {
                  setAfterFile(null);
                  setAfterUrl(null);
                }}
              />
            </div>
          </Section>

          {error && <p className="mt-4 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>}

          {mode === "edit" && (
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
                  submitting && "opacity-70"
                )}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึกการแก้ไข
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle";

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("border-b border-border pb-5", last ? "border-b-0 pb-0" : "mb-5")}>
      <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-warning">*</span>}
      </span>
      {children}
    </label>
  );
}

function ViewValue({ children }: { children: React.ReactNode }) {
  return <p className="whitespace-pre-wrap text-sm text-foreground">{children}</p>;
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

function PhotoField({
  label,
  labelClassName,
  url,
  file,
  editable,
  inputRef,
  onPick,
  onRemove,
}: {
  label: string;
  labelClassName?: string;
  url: string | null;
  file: File | null;
  editable: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (file: File | null) => void;
  onRemove: () => void;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : url;

  return (
    <div>
      <span className={cn("mb-1.5 block text-xs font-bold", labelClassName)}>{label}</span>
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      )}

      {previewUrl ? (
        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          {editable && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          )}
          {!editable && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label={label}
            />
          )}
        </div>
      ) : editable ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Camera className="h-6 w-6" strokeWidth={1.75} />
          <span className="text-xs">คลิกหรือลากไฟล์มาวางที่นี่</span>
        </button>
      ) : (
        <div className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
          ไม่มีรูปภาพ
        </div>
      )}

      {editable && previewUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary"
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
          เปลี่ยนรูป
        </button>
      )}
    </div>
  );
}
