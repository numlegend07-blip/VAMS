"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  valveId: string;
  currentRemark: string | null;
};

export default function ConfirmDataButton({ valveId, currentRemark }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  async function handleConfirm() {
    if (!window.confirm("ยืนยันว่าตรวจสอบข้อมูลวาล์วนี้แล้ว และข้อมูลยังถูกต้อง ไม่มีการเปลี่ยนแปลง?")) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      // No real field changes — this only exists to bump `updated_at` (via the
      // valves_set_updated_at trigger, which fires on any UPDATE regardless of
      // whether values differ) so a branch that rechecked and found nothing to
      // change still shows up as "updated" on the activity tracker.
      const { error } = await supabase.from("valves").update({ remark: currentRemark }).eq("id", valveId);
      if (error) throw error;

      setJustConfirmed(true);
      router.refresh();
      setTimeout(() => setJustConfirmed(false), 3000);
    } catch {
      window.alert("ยืนยันข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={submitting}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
        justConfirmed
          ? "border-success/40 bg-success-subtle text-success"
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      )}
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
      )}
      {justConfirmed ? "ยืนยันแล้ว" : "ยืนยันข้อมูลถูกต้อง"}
    </button>
  );
}
