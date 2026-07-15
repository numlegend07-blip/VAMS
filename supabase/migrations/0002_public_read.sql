-- อนุญาตให้ทุกคนดูข้อมูล branches/valves/pm_history ได้โดยไม่ต้อง login
-- (แชร์ลิงก์ dashboard ให้ผู้บริหารดูได้เลย) — การเพิ่ม/แก้ไข ยังคงต้อง login เหมือนเดิม
-- รันไฟล์นี้ต่อจาก 0001_init_schema.sql ใน Supabase SQL Editor

drop policy if exists "branches_select" on branches;
create policy "branches_select" on branches
  for select to anon, authenticated using (true);

drop policy if exists "valves_select" on valves;
create policy "valves_select" on valves
  for select to anon, authenticated using (true);

drop policy if exists "pm_history_select" on pm_history;
create policy "pm_history_select" on pm_history
  for select to anon, authenticated using (true);
