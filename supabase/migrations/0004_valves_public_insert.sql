-- เปิดให้เพิ่มวาล์วใหม่ได้จากหน้าแผนที่โดยไม่ต้อง login ไปก่อน (ยังไม่มีระบบ login พนักงาน)
-- เหมือนแนวทางเดียวกับ pm_history ใน 0003_pm_photos_and_public_write.sql
-- แก้ไข/ลบวาล์ว ยังคงต้อง login และจำกัดสิทธิ์ตามสาขาเหมือนเดิม
-- จะกลับมาจำกัดสิทธิ์การเพิ่มตามสาขาอีกครั้งเมื่อสร้างระบบ login เสร็จ
-- รันไฟล์นี้ต่อจาก 0003_pm_photos_and_public_write.sql ใน Supabase SQL Editor

drop policy if exists "valves_write" on valves;

create policy "valves_insert" on valves
  for insert to anon, authenticated with check (true);

create policy "valves_update" on valves
  for update to authenticated
  using (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  )
  with check (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  );

create policy "valves_delete" on valves
  for delete to authenticated
  using (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  );
