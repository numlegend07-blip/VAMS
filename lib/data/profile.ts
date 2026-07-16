import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, employee_code, full_name, position, department, role, branch_id, branch:branches(id, name)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`โหลดข้อมูลผู้ใช้ไม่สำเร็จ: ${error.message}`);
  }

  return data as unknown as Profile | null;
}
