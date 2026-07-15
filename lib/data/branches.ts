import { createClient } from "@/lib/supabase/server";
import { Branch } from "@/types";

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`โหลดข้อมูลสาขาไม่สำเร็จ: ${error.message}`);
  }

  return data as Branch[];
}
