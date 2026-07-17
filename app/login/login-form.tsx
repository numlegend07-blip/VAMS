"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeCode.trim() || !password) {
      setError("กรุณากรอกรหัสพนักงานและรหัสผ่าน");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${employeeCode.trim()}@vams.local`,
        password,
      });

      if (signInError) {
        setError("รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push("/valves");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4.5">
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/70">
          รหัสพนักงาน
        </label>
        <input
          type="text"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          placeholder="เช่น 12345"
          autoComplete="username"
          className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary focus:bg-primary/12 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/70">
          รหัสผ่าน
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่าน"
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary focus:bg-primary/12 focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
          ใช้รหัสพนักงานเป็นรหัสผ่าน (ไม่ใช่รหัสผ่านเว็บ กปภ. เดิม)
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/15 px-3 py-2.5 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-extrabold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30",
          submitting && "opacity-70"
        )}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" strokeWidth={2.5} />}
        เข้าสู่ระบบ
      </button>
    </form>
  );
}
