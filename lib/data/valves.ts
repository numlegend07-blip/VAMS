import { createClient } from "@/lib/supabase/server";
import { ValveWithBranch } from "@/types";

export async function getValves(): Promise<ValveWithBranch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("valves")
    .select("*, branch:branches(id, name)")
    .order("branch_id")
    .order("seq_no");

  if (error) {
    throw new Error(`โหลดข้อมูลวาล์วไม่สำเร็จ: ${error.message}`);
  }

  return data as unknown as ValveWithBranch[];
}

export async function getValveById(id: string): Promise<ValveWithBranch | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("valves")
    .select("*, branch:branches(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`โหลดข้อมูลวาล์วไม่สำเร็จ: ${error.message}`);
  }

  return data as unknown as ValveWithBranch | null;
}
