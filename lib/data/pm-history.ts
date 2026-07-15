import { createClient } from "@/lib/supabase/server";
import { PMRecord } from "@/types";

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
