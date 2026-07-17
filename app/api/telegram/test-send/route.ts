import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "region_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { chatId, label } = await req.json().catch(() => ({}));
  if (!chatId || typeof chatId !== "string") {
    return NextResponse.json({ error: "กรุณาระบุ chat id" }, { status: 400 });
  }

  try {
    await sendTelegramMessage(
      chatId,
      `✅ ทดสอบการเชื่อมต่อ VAMS${label ? ` — ${label}` : ""}\nถ้าเห็นข้อความนี้แปลว่าตั้งค่าถูกต้องแล้ว`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
