import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatThaiDate } from "@/lib/format";

type PMRecordRow = {
  pm_type: string;
  performed_at: string;
  created_by_name: string | null;
  status_after: string | null;
  valve: {
    asset_code: string | null;
    location: string | null;
    branch: { name: string; telegram_chat_id: string | null } | null;
  } | null;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { recordId } = await req.json().catch(() => ({}));
  if (!recordId || typeof recordId !== "string") {
    return NextResponse.json({ error: "recordId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pm_history")
    .select(
      "pm_type, performed_at, created_by_name, status_after, valve:valves(asset_code, location, branch:branches(name, telegram_chat_id))"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "ไม่พบบันทึก" }, { status: 404 });
  }

  const record = data as unknown as PMRecordRow;

  const { data: settings } = await supabase
    .from("app_settings")
    .select("telegram_region_chat_id")
    .eq("id", 1)
    .maybeSingle();

  const branchName = record.valve?.branch?.name ?? "-";
  const text =
    `📝 <b>บันทึก PM ใหม่ — ${branchName}</b>\n` +
    `วาล์ว: ${record.valve?.asset_code ?? "-"} — ${record.valve?.location ?? "-"}\n` +
    `ประเภทงาน: ${record.pm_type}\n` +
    `วันที่: ${formatThaiDate(record.performed_at)}\n` +
    `ผู้บันทึก: ${record.created_by_name ?? "-"}` +
    (record.status_after ? `\nสถานะหลังตรวจ: ${record.status_after}` : "");

  const targets = [...new Set([record.valve?.branch?.telegram_chat_id, settings?.telegram_region_chat_id])].filter(
    (id): id is string => Boolean(id)
  );

  const results = await Promise.allSettled(targets.map((chatId) => sendTelegramMessage(chatId, text)));
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map((r) => String(r.reason));

  return NextResponse.json({ ok: true, sent, errors });
}
