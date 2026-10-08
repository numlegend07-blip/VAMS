import { createClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

export const MAX_VALVE_IMAGES = 4;

export async function uploadValveImage(
  supabase: SupabaseClient,
  file: File,
  folder?: string
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = folder ? `valves/${folder}/${crypto.randomUUID()}.${ext}` : `valves/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("valve-images").upload(path, file);
  if (error) {
    throw new Error(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
  }

  return supabase.storage.from("valve-images").getPublicUrl(path).data.publicUrl;
}
