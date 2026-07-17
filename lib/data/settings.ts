import { createClient } from "@/lib/supabase/server";
import { AppSettings } from "@/types";

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("telegram_region_chat_id, telegram_region_invite_link")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`โหลดข้อมูลตั้งค่าไม่สำเร็จ: ${error.message}`);
  }

  return data ?? { telegram_region_chat_id: null, telegram_region_invite_link: null };
}
