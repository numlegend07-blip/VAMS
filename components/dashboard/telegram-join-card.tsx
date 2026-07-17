"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Send } from "lucide-react";

import CardHeader from "@/components/ui/card-header";

type Props = {
  label: string;
  link: string;
};

export default function TelegramJoinCard({ label, link }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <CardHeader
        icon={Send}
        color="primary"
        title="เข้าร่วมกลุ่มแจ้งเตือน Telegram"
        subtitle={label}
      />
      <div className="flex flex-wrap items-center gap-5 px-4.5 py-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-2">
          <QRCodeSVG value={link} size={80} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            สแกน QR หรือกดลิงก์เพื่อเข้าร่วมกลุ่มรับแจ้งเตือน PM ค้างกำหนดผ่าน Telegram
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Send className="h-3.5 w-3.5" strokeWidth={2.25} />
              เปิดในแอป Telegram
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.25} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
              {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
