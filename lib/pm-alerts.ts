import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

type ValveRow = {
  id: string;
  asset_code: string | null;
  location: string | null;
  branch_id: string;
  branch: { name: string; telegram_chat_id: string | null } | null;
};

type Flagged = { valve: ValveRow; diffDays: number; overdue: boolean };

export type PmAlertsResult = {
  flaggedCount: number;
  sent: string[];
  errors: string[];
  preview: { label: string; chatId: string; text: string }[];
};

const DUE_SOON_WINDOW_DAYS = 7;

export async function runPmAlertsDigest(dryRun: boolean): Promise<PmAlertsResult> {
  const supabase = createAdminClient();

  const [{ data: valves, error: valvesError }, { data: pmRows, error: pmError }, { data: settings }] =
    await Promise.all([
      supabase
        .from("valves")
        .select("id, asset_code, location, branch_id, branch:branches(name, telegram_chat_id)"),
      supabase
        .from("pm_history")
        .select("valve_id, next_due_at, performed_at")
        .order("performed_at", { ascending: false }),
      supabase.from("app_settings").select("telegram_region_chat_id").eq("id", 1).maybeSingle(),
    ]);

  if (valvesError) throw new Error(valvesError.message);
  if (pmError) throw new Error(pmError.message);

  // pmRows is ordered by performed_at desc, so the first row seen per valve is its latest PM record
  const latestDue = new Map<string, string | null>();
  for (const row of pmRows ?? []) {
    if (!latestDue.has(row.valve_id)) latestDue.set(row.valve_id, row.next_due_at);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const flagged: Flagged[] = [];
  for (const valve of (valves ?? []) as unknown as ValveRow[]) {
    const dueStr = latestDue.get(valve.id);
    if (!dueStr) continue;

    const dueDate = new Date(dueStr);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);
    if (diffDays <= DUE_SOON_WINDOW_DAYS) {
      flagged.push({ valve, diffDays, overdue: diffDays < 0 });
    }
  }

  const byBranch = new Map<string, Flagged[]>();
  for (const item of flagged) {
    const list = byBranch.get(item.valve.branch_id) ?? [];
    list.push(item);
    byBranch.set(item.valve.branch_id, list);
  }

  const sent: string[] = [];
  const errors: string[] = [];
  const preview: PmAlertsResult["preview"] = [];

  const todayLabel = today.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    calendar: "buddhist",
  });

  for (const items of byBranch.values()) {
    const chatId = items[0].valve.branch?.telegram_chat_id;
    if (!chatId) continue;

    const branchName = items[0].valve.branch?.name ?? "-";
    const lines = items
      .sort((a, b) => a.diffDays - b.diffDays)
      .map((i) => {
        const label = i.overdue
          ? `⛔ เกินกำหนด ${Math.abs(i.diffDays)} วัน`
          : `⚠️ ใกล้ครบกำหนดใน ${i.diffDays} วัน`;
        return `• ${i.valve.asset_code ?? i.valve.id.slice(0, 8)} — ${i.valve.location ?? "-"} (${label})`;
      });

    const text = `🔧 <b>แจ้งเตือน PM — ${branchName}</b>\nวันที่ ${todayLabel}\n\n${lines.join("\n")}`;

    if (dryRun) {
      preview.push({ label: branchName, chatId, text });
      continue;
    }

    try {
      await sendTelegramMessage(chatId, text);
      sent.push(branchName);
    } catch (err) {
      errors.push(`${branchName}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  const regionChatId = settings?.telegram_region_chat_id;
  if (regionChatId) {
    const overdueCount = flagged.filter((f) => f.overdue).length;
    const dueSoonCount = flagged.length - overdueCount;

    const branchLines = [...byBranch.values()]
      .map((items) => {
        const name = items[0].valve.branch?.name ?? "-";
        const overdue = items.filter((i) => i.overdue).length;
        return { name, overdue, dueSoon: items.length - overdue, total: items.length };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const summaryText =
      flagged.length === 0
        ? `✅ <b>สรุปรายวัน เขต 10</b>\nวันที่ ${todayLabel}\nวันนี้ไม่มีวาล์วเกินกำหนดหรือใกล้ครบกำหนด PM`
        : `📊 <b>สรุปรายวัน เขต 10</b>\nวันที่ ${todayLabel}\nเกินกำหนด ${overdueCount} จุด / ใกล้ครบกำหนด ${dueSoonCount} จุด\n\n` +
          branchLines.map((b) => `• ${b.name}: เกินกำหนด ${b.overdue}, ใกล้ครบ ${b.dueSoon}`).join("\n");

    if (dryRun) {
      preview.push({ label: "เขต 10 (สรุปรวม)", chatId: regionChatId, text: summaryText });
    } else {
      try {
        await sendTelegramMessage(regionChatId, summaryText);
        sent.push("เขต 10 (สรุปรวม)");
      } catch (err) {
        errors.push(`เขต 10: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }
  }

  return { flaggedCount: flagged.length, sent, errors, preview };
}
