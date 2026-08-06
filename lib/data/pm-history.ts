import { createClient } from "@/lib/supabase/server";
import { PMRecord, PMRecordWithValve } from "@/types";

export async function getPMHistory(valveId: string): Promise<PMRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pm_history")
    .select("*")
    .eq("valve_id", valveId)
    .order("performed_at", { ascending: false });

  if (error) {
    throw new Error(`โหลดประวัติ PM ไม่สำเร็จ: ${error.message}`);
  }

  return data as PMRecord[];
}

export async function getAllPMHistory(limit?: number): Promise<PMRecordWithValve[]> {
  const supabase = await createClient();

  let query = supabase
    .from("pm_history")
    .select("*, valve:valves(id, asset_code, location, branch_id, status, branch:branches(id, name))")
    .order("performed_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`โหลดประวัติ PM ไม่สำเร็จ: ${error.message}`);
  }

  return data as unknown as PMRecordWithValve[];
}

export type DueValve = {
  id: string;
  asset_code: string | null;
  location: string | null;
  branch_name: string;
  due_at: string;
  diff_days: number;
  overdue: boolean;
};

const DUE_SOON_WINDOW_DAYS = 7;

export async function getDueValves(): Promise<DueValve[]> {
  const supabase = await createClient();

  const [{ data: valves, error: valvesError }, { data: pmRows, error: pmError }] = await Promise.all([
    supabase.from("valves").select("id, asset_code, location, branch:branches(name)"),
    supabase.from("pm_history").select("valve_id, next_due_at, performed_at").order("performed_at", { ascending: false }),
  ]);

  if (valvesError) {
    throw new Error(`โหลดข้อมูลวาล์วไม่สำเร็จ: ${valvesError.message}`);
  }
  if (pmError) {
    throw new Error(`โหลดประวัติ PM ไม่สำเร็จ: ${pmError.message}`);
  }

  // pmRows is ordered by performed_at desc, so the first row seen per valve is its latest PM record
  const latestDue = new Map<string, string | null>();
  for (const row of pmRows ?? []) {
    if (!latestDue.has(row.valve_id)) latestDue.set(row.valve_id, row.next_due_at);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due: DueValve[] = [];
  for (const valve of (valves ?? []) as unknown as {
    id: string;
    asset_code: string | null;
    location: string | null;
    branch: { name: string } | null;
  }[]) {
    const dueStr = latestDue.get(valve.id);
    if (!dueStr) continue;

    const dueDate = new Date(dueStr);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);
    if (diffDays <= DUE_SOON_WINDOW_DAYS) {
      due.push({
        id: valve.id,
        asset_code: valve.asset_code,
        location: valve.location,
        branch_name: valve.branch?.name ?? "-",
        due_at: dueStr,
        diff_days: diffDays,
        overdue: diffDays < 0,
      });
    }
  }

  return due.sort((a, b) => a.diff_days - b.diff_days);
}

export type PMStats = {
  total: number;
  month: number;
  valveTotal: number;
  broken: number;
};

export async function getPMStats(): Promise<PMStats> {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);

  const [totalRes, monthRes, valveTotalRes, brokenRes] = await Promise.all([
    supabase.from("pm_history").select("*", { count: "exact", head: true }),
    supabase.from("pm_history").select("*", { count: "exact", head: true }).gte("performed_at", startOfMonthStr),
    supabase.from("valves").select("*", { count: "exact", head: true }),
    supabase
      .from("valves")
      .select("*", { count: "exact", head: true })
      .eq("status", "ไม่ได้ใช้งาน")
      .ilike("inactive_reason", "%ชำรุด%"),
  ]);

  const firstError = [totalRes, monthRes, valveTotalRes, brokenRes].find((r) => r.error)?.error;
  if (firstError) {
    throw new Error(`โหลดสรุปข้อมูล PM ไม่สำเร็จ: ${firstError.message}`);
  }

  return {
    total: totalRes.count ?? 0,
    month: monthRes.count ?? 0,
    valveTotal: valveTotalRes.count ?? 0,
    broken: brokenRes.count ?? 0,
  };
}
