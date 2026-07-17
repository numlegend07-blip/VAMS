import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { runPmAlertsDigest } from "@/lib/pm-alerts";
import { isSuperAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_code")
    .eq("id", user.id)
    .maybeSingle();
  if (!isSuperAdmin(profile?.employee_code)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const dryRun = Boolean(body?.dryRun);

  try {
    const result = await runPmAlertsDigest(dryRun);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
