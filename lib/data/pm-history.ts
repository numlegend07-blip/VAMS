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
    supabase.from("valves").select("*", { count: "exact", head: true }).eq("status", "ไม่ได้ใช้งาน"),
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
