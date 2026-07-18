"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Megaphone,
  Info,
  Settings as SettingsIcon,
  Building2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import CardHeader from "@/components/ui/card-header";
import { cn } from "@/lib/utils";
import { AppSettings, Branch } from "@/types";

type Props = {
  branches: Branch[];
  settings: AppSettings;
};

type TestResult = { ok: boolean; message?: string };
type PreviewItem = { label: string; chatId: string; text: string };
type DigestResult = { sent: string[]; errors: string[]; flaggedCount: number } | { error: string };

export default function SettingsForm({ branches, settings }: Props) {
  const router = useRouter();

  const [regionChatId, setRegionChatId] = useState(settings.telegram_region_chat_id ?? "");
  const [regionInviteLink, setRegionInviteLink] = useState(settings.telegram_region_invite_link ?? "");
  const [chatIds, setChatIds] = useState<Record<string, string>>(
    Object.fromEntries(branches.map((b) => [b.id, b.telegram_chat_id ?? ""]))
  );
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>(
    Object.fromEntries(branches.map((b) => [b.id, b.telegram_invite_link ?? ""]))
  );

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewItem[] | null>(null);

  const [digestLoading, setDigestLoading] = useState(false);
  const [digestResult, setDigestResult] = useState<DigestResult | null>(null);

  async function handleTest(chatId: string, label: string, key: string) {
    if (!chatId.trim()) return;
    setTestingKey(key);
    setTestResults((prev) => ({ ...prev, [key]: { ok: false, message: undefined } }));

    try {
      const res = await fetch("/api/telegram/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chatId.trim(), label }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "ทดสอบไม่สำเร็จ");
      setTestResults((prev) => ({ ...prev, [key]: { ok: true } }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [key]: { ok: false, message: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" },
      }));
    } finally {
      setTestingKey(null);
    }
  }

  async function handleSaveAll() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const supabase = createClient();

      const { error: settingsError } = await supabase
        .from("app_settings")
        .update({
          telegram_region_chat_id: regionChatId.trim() || null,
          telegram_region_invite_link: regionInviteLink.trim() || null,
        })
        .eq("id", 1);
      if (settingsError) throw new Error(settingsError.message);

      const results = await Promise.all(
        branches.map((b) =>
          supabase
            .from("branches")
            .update({
              telegram_chat_id: chatIds[b.id]?.trim() || null,
              telegram_invite_link: inviteLinks[b.id]?.trim() || null,
            })
            .eq("id", b.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);

      setSaveMessage("บันทึกเรียบร้อย");
      router.refresh();
    } catch (err) {
      setSaveMessage(err instanceof Error ? `บันทึกไม่สำเร็จ: ${err.message}` : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await fetch("/api/telegram/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "โหลดตัวอย่างไม่สำเร็จ");
      setPreviewData(body.preview);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSendNow() {
    if (!confirm("ยืนยันส่งข้อความแจ้งเตือนจริงไปยัง Telegram ตอนนี้เลยหรือไม่?")) return;

    setDigestLoading(true);
    setDigestResult(null);
    try {
      const res = await fetch("/api/telegram/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "ส่งไม่สำเร็จ");
      setDigestResult(body);
    } catch (err) {
      setDigestResult({ error: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" });
    } finally {
      setDigestLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-[19px] font-extrabold text-foreground">ตั้งค่า</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          ตั้งค่าการแจ้งเตือน PM ค้างกำหนดผ่าน Telegram (เฉพาะผู้ดูแลระดับเขต)
        </p>
        <p className="mt-2 text-xs">
          <span className="text-muted-foreground">cron แจ้งเตือนรันครั้งล่าสุด: </span>
          {settings.last_alert_run_at ? (
            <>
              <span className="font-semibold text-foreground">
                {new Date(settings.last_alert_run_at).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Bangkok",
                })}
              </span>
              {settings.last_alert_run_status && (
                <span
                  className={cn(
                    "ml-1.5",
                    settings.last_alert_run_status.startsWith("error") ? "text-danger" : "text-success"
                  )}
                >
                  ({settings.last_alert_run_status})
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">ยังไม่เคยรัน</span>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <CardHeader icon={Info} title="วิธีตั้งค่า Telegram" subtitle="ทำครั้งเดียว ใช้ได้ทุกกลุ่ม" />
        <div className="space-y-1.5 px-4.5 py-4 text-xs leading-relaxed text-muted-foreground">
          <p>1. สร้างบอทผ่าน Telegram: คุยกับ <span className="font-semibold text-foreground">@BotFather</span> → พิมพ์ <span className="font-mono">/newbot</span> → ตั้งชื่อ แล้วจะได้ Bot Token มา (ให้ผู้ดูแลระบบนำไปตั้งค่าใน Vercel)</p>
          <p>2. เพิ่มบอทเข้ากลุ่ม Telegram ของแต่ละสาขา (และกลุ่มกลางของเขต 10)</p>
          <p>3. หา Chat ID ของกลุ่ม: เพิ่ม <span className="font-semibold text-foreground">@RawDataBot</span> เข้ากลุ่มชั่วคราว บอทจะตอบกลับ Chat ID (ตัวเลขติดลบ เช่น -1001234567890) แล้วเอาบอทออกได้เลย</p>
          <p>4. นำ Chat ID มากรอกในแบบฟอร์มด้านล่าง แล้วกด &quot;ทดสอบ&quot; เพื่อเช็กว่าเชื่อมต่อถูกต้อง</p>
          <p>5. (ไม่บังคับ) หาลิงก์เชิญเข้ากลุ่ม: เปิดกลุ่ม → แตะชื่อกลุ่ม → &quot;Invite Link&quot; หรือ &quot;เชิญผ่านลิงก์&quot; → คัดลอกลิงก์ (ขึ้นต้นด้วย https://t.me/+) มากรอกไว้ พนักงานจะกดลิงก์หรือสแกน QR เข้ากลุ่มเองได้จากหน้าแดชบอร์ด ไม่ต้องเชิญทีละคน</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <CardHeader icon={Megaphone} color="purple" title="แชทกลางเขต 10" subtitle="รับสรุปภาพรวมทุกสาขาทุกวัน" />
        <div className="flex flex-col gap-2.5 px-4.5 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={regionChatId}
              onChange={(e) => setRegionChatId(e.target.value)}
              placeholder="Chat ID เช่น -1001234567890"
              className={inputClass}
            />
            <TestButton
              disabled={!regionChatId.trim()}
              testing={testingKey === "region"}
              result={testResults["region"]}
              onClick={() => handleTest(regionChatId, "เขต 10 (สรุปรวม)", "region")}
            />
          </div>
          <input
            value={regionInviteLink}
            onChange={(e) => setRegionInviteLink(e.target.value)}
            placeholder="ลิงก์เชิญเข้ากลุ่ม เช่น https://t.me/+xxxxxxxxxxxx"
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <CardHeader icon={Building2} title="แชทรายสาขา" subtitle={`${branches.length} สาขา (ไม่บังคับ)`} />
        <p className="border-b border-border px-4.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          ไม่จำเป็นต้องตั้งค่าส่วนนี้ก็ได้ — ถ้าอยากรวมทุกสาขาไว้กลุ่มเดียว (ให้ตัวแทนแต่ละสาขาอยู่กลุ่มกลาง) แค่ตั้งค่า
          &quot;แชทกลางเขต 10&quot; ด้านบนก็พอ สรุปที่ส่งไปจะแสดงครบทุกสาขาที่มีรายการค้างอยู่แล้ว ส่วนนี้มีไว้เผื่อบางสาขาอยากแยกกลุ่มของตัวเองเพิ่มเติม
        </p>
        <div className="max-h-100 overflow-y-auto">
          {branches.map((b, i) => (
            <div
              key={b.id}
              className={cn(
                "flex flex-col gap-2 px-4.5 py-2.5",
                i !== branches.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-40 shrink-0 truncate text-xs font-medium text-foreground">{b.name}</span>
                <input
                  value={chatIds[b.id] ?? ""}
                  onChange={(e) => setChatIds((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  placeholder="Chat ID (ไม่บังคับ)"
                  className={cn(inputClass, "max-w-56")}
                />
                <TestButton
                  disabled={!(chatIds[b.id] ?? "").trim()}
                  testing={testingKey === b.id}
                  result={testResults[b.id]}
                  onClick={() => handleTest(chatIds[b.id] ?? "", b.name, b.id)}
                />
              </div>
              <input
                value={inviteLinks[b.id] ?? ""}
                onChange={(e) => setInviteLinks((prev) => ({ ...prev, [b.id]: e.target.value }))}
                placeholder="ลิงก์เชิญเข้ากลุ่ม (ไม่บังคับ)"
                className={cn(inputClass, "ml-0 sm:ml-42.5 max-w-72")}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
            saving && "opacity-70"
          )}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          บันทึกการตั้งค่า
        </button>

        <button
          type="button"
          onClick={handlePreview}
          disabled={previewLoading}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted disabled:opacity-70"
        >
          {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" strokeWidth={2.25} />}
          ดูตัวอย่างข้อความวันนี้
        </button>

        <button
          type="button"
          onClick={handleSendNow}
          disabled={digestLoading}
          className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning-subtle px-4 py-2.5 text-sm font-semibold text-warning hover:bg-warning/20 disabled:opacity-70"
        >
          {digestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2.25} />}
          ส่งสรุปตอนนี้
        </button>

        {saveMessage && <span className="text-xs font-medium text-muted-foreground">{saveMessage}</span>}
      </div>

      {previewData && (
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <CardHeader icon={SettingsIcon} title="ตัวอย่างข้อความ" subtitle={`${previewData.length} ข้อความที่จะส่ง`} />
          <div className="flex flex-col gap-3 px-4.5 py-4">
            {previewData.length === 0 ? (
              <p className="text-xs text-muted-foreground">ยังไม่มีสาขาไหนตั้งค่า Chat ID ไว้</p>
            ) : (
              previewData.map((p, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface-muted p-3">
                  <div className="mb-1.5 text-[11px] font-bold text-foreground">{p.label}</div>
                  <pre className="whitespace-pre-wrap break-words font-sans text-[11px] text-muted-foreground">
                    {p.text.replace(/<\/?b>/g, "")}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {digestResult && (
        <div className="rounded-xl border border-border bg-surface p-4.5 text-xs shadow-sm">
          {"error" in digestResult ? (
            <p className="text-danger">{digestResult.error}</p>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                ส่งสำเร็จ {digestResult.sent.length} แชท จากทั้งหมด {digestResult.flaggedCount} รายการที่ต้องแจ้งเตือน
              </p>
              {digestResult.errors.length > 0 && (
                <p className="text-danger">ผิดพลาด: {digestResult.errors.join(", ")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestButton({
  disabled,
  testing,
  result,
  onClick,
}: {
  disabled: boolean;
  testing: boolean;
  result?: TestResult;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || testing}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" strokeWidth={2.25} />}
        ทดสอบ
      </button>
      {result?.ok === true && <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={2.25} />}
      {result && !result.ok && result.message && (
        <span title={result.message}>
          <XCircle className="h-4 w-4 text-danger" strokeWidth={2.25} />
        </span>
      )}
    </div>
  );
}

const inputClass =
  "min-w-48 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle";
