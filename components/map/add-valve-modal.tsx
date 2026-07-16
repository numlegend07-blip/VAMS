"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Branch, ValveStatus } from "@/types";
import { cn } from "@/lib/utils";

type FormState = {
  asset_code: string;
  location: string;
  branch_id: string;
  valve_type: string;
  brand: string;
  model: string;
  size_mm: string;
  latitude: string;
  longitude: string;
  install_year_be: string;
  status: ValveStatus;
};

const EMPTY_FORM: FormState = {
  asset_code: "",
  location: "",
  branch_id: "",
  valve_type: "",
  brand: "",
  model: "",
  size_mm: "",
  latitude: "",
  longitude: "",
  install_year_be: "",
  status: "ใช้งาน",
};

type Props = {
  branches: Branch[];
};

export default function AddValveModal({ branches }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function close() {
    setOpen(false);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.asset_code.trim() || !form.location.trim() || !form.branch_id || !form.valve_type.trim() || !form.brand.trim()) {
      setError("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("valves").insert({
        asset_code: form.asset_code.trim(),
        location: form.location.trim(),
        branch_id: form.branch_id,
        valve_type: form.valve_type.trim(),
        brand: form.brand.trim(),
        model: form.model.trim() || null,
        size_mm: form.size_mm ? Number(form.size_mm) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        install_year_be: form.install_year_be ? Number(form.install_year_be) : null,
        status: form.status,
      });

      if (insertError) {
        throw new Error(`บันทึกไม่สำเร็จ: ${insertError.message}`);
      }

      router.refresh();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        เพิ่มจุดติดตั้ง
      </button>

      {open && (
        <div className="fixed inset-0 z-100 isolate flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-extrabold text-foreground">เพิ่มจุดติดตั้งวาล์ว</h3>
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="รหัสวาล์ว" required>
                  <input
                    value={form.asset_code}
                    onChange={(e) => set("asset_code", e.target.value)}
                    placeholder="เช่น CV-001"
                    className={inputClass}
                  />
                </Field>

                <Field label="ชื่อจุดติดตั้ง" required>
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="ชื่อสถานที่"
                    className={inputClass}
                  />
                </Field>

                <Field label="สาขา" required>
                  <select
                    value={form.branch_id}
                    onChange={(e) => set("branch_id", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- เลือกสาขา --</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="ชนิดวาล์ว" required>
                  <input
                    value={form.valve_type}
                    onChange={(e) => set("valve_type", e.target.value)}
                    placeholder="เช่น PRV, FLOAT, ACV"
                    className={inputClass}
                  />
                </Field>

                <Field label="ยี่ห้อ" required>
                  <input
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="เช่น Bermad, Dorot, Cla-Val"
                    className={inputClass}
                  />
                </Field>

                <Field label="รุ่น">
                  <input
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="ขนาดวาล์ว (มม.)">
                  <input
                    type="number"
                    value={form.size_mm}
                    onChange={(e) => set("size_mm", e.target.value)}
                    placeholder="150"
                    className={inputClass}
                  />
                </Field>

                <Field label="ปีที่ติดตั้ง (พ.ศ.)">
                  <input
                    type="number"
                    value={form.install_year_be}
                    onChange={(e) => set("install_year_be", e.target.value)}
                    placeholder="2565"
                    className={inputClass}
                  />
                </Field>

                <Field label="ละติจูด">
                  <input
                    type="number"
                    step="0.00001"
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                    placeholder="13.7563"
                    className={inputClass}
                  />
                </Field>

                <Field label="ลองจิจูด">
                  <input
                    type="number"
                    step="0.00001"
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                    placeholder="100.5018"
                    className={inputClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="สถานะวาล์ว">
                    <select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value as ValveStatus)}
                      className={inputClass}
                    >
                      <option value="ใช้งาน">✅ ใช้งานปกติ</option>
                      <option value="ไม่ได้ใช้งาน">🔴 ไม่ได้ใช้งาน</option>
                      <option value="ไม่ระบุ">⚫ ไม่ระบุสถานะ</option>
                    </select>
                  </Field>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
                    submitting && "opacity-70"
                  )}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-warning">*</span>}
      </span>
      {children}
    </label>
  );
}
