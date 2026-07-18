import { NextRequest, NextResponse } from "next/server";

import { runPmAlertsDigest } from "@/lib/pm-alerts";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function recordRun(status: string) {
  const supabase = createAdminClient();
  await supabase
    .from("app_settings")
    .update({ last_alert_run_at: new Date().toISOString(), last_alert_run_status: status })
    .eq("id", 1);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dry_run") === "1";

  try {
    const result = await runPmAlertsDigest(dryRun);
    if (!dryRun) {
      await recordRun(`ok — ส่ง ${result.sent.length} แชท, ผิดพลาด ${result.errors.length}`);
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (!dryRun) {
      await recordRun(`error: ${message}`);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
