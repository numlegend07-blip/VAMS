"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { PMType } from "@/types";
import { PM_TYPES } from "@/lib/pm-type";
import { cn } from "@/lib/utils";

type Props = {
  valveId: string;
  onDone: () => void;
};

export default function PMForm({ valveId, onDone }: Props) {
  const router = useRouter();
  const [performedAt, setPerformedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [title, setTitle] = useState("");
  const [pmType, setPmType] = useState<PMType>(PM_TYPES[0]);
  const [description, setDescription] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(file: File, label: "before" | "after") {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `pm/${valveId}/${crypto.randomUUID()}-${label}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("valve-images")
      .upload(path, file);

    if (uploadError) {
      throw new Error(`อัปโหลดรูป${label === "before" ? "ก่อน" : "หลัง"}ไม่สำเร็จ: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("valve-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("กรุณากรอกหัวข้องาน");
      return;
    }

    setSubmitting(true);
    try {
      const [photoBeforeUrl, photoAfterUrl] = await Promise.all([
        beforeFile ? uploadPhoto(beforeFile, "before") : Promise.resolve(null),
        afterFile ? uploadPhoto(afterFile, "after") : Promise.resolve(null),
      ]);

      const supabase = createClient();
      const { data: inserted, error: insertError } = await supabase
        .from("pm_history")
        .insert({
          valve_id: valveId,
          performed_at: performedAt,
          title: title.trim(),
          description: description.trim() || null,
          pm_type: pmType,
          photo_before_url: photoBeforeUrl,
          photo_after_url: photoAfterUrl,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`บันทึกไม่สำเร็จ: ${insertError.message}`);
      }

      if (inserted?.id) {
        fetch("/api/telegram/notify-pm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: inserted.id }),
        }).catch(() => {});
      }

      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-foreground">เพิ่มบันทึก PM</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="วันที่ทำงาน">
          <input
            type="date"
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
            required
          />
        </Field>

        <Field label="ประเภทงาน">
          <select
            value={pmType}
            onChange={(e) => setPmType(e.target.value as PMType)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
          >
            {PM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="หัวข้องาน">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ตรวจสอบแรงดัน / เปลี่ยน Pilot Valve"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary-subtle"
              required
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="รายละเอียด (ถ้ามี)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary-subtle"
            />
          </Field>
        </div>

        <PhotoPicker
          label="รูปก่อนทำ"
          file={beforeFile}
          onChange={setBeforeFile}
          inputRef={beforeInputRef}
        />
        <PhotoPicker
          label="รูปหลังทำ"
          file={afterFile}
          onChange={setAfterFile}
          inputRef={afterInputRef}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-3">
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
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function PhotoPicker({
  label,
  file,
  onChange,
  inputRef,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border">
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
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-5 w-5" strokeWidth={2} />
          <span className="text-xs">แนบรูปภาพ</span>
        </button>
      )}
    </div>
  );
}
