-- เพิ่มฟิลด์รูปก่อน/หลัง + ประเภทงาน PM
-- และเปิดให้เพิ่มบันทึก PM ได้โดยไม่ต้อง login ไปก่อน (ยังไม่มีระบบ login พนักงาน)
-- จะกลับมาจำกัดสิทธิ์ตามสาขาอีกครั้งเมื่อสร้างระบบ login เสร็จ
-- รันต่อจาก 0002_public_read.sql ใน Supabase SQL Editor

alter table pm_history
  add column pm_type text not null default 'ตรวจสอบ'
    check (pm_type in ('ตรวจสอบ', 'ซ่อมบำรุง', 'เปลี่ยนอะไหล่')),
  add column photo_before_url text,
  add column photo_after_url text;

-- แทนที่ policy เดิม (for all) ด้วย insert แบบเปิด + update/delete ยังคงจำกัดสิทธิ์
drop policy if exists "pm_history_write" on pm_history;

create policy "pm_history_insert" on pm_history
  for insert to anon, authenticated with check (true);

create policy "pm_history_update" on pm_history
  for update to authenticated
  using (
    exists (
      select 1 from valves v
      where v.id = pm_history.valve_id
        and (
          (select role from public.current_profile()) = 'region_admin'
          or v.branch_id = (select branch_id from public.current_profile())
        )
    )
  );

create policy "pm_history_delete" on pm_history
  for delete to authenticated
  using (
    exists (
      select 1 from valves v
      where v.id = pm_history.valve_id
        and (
          (select role from public.current_profile()) = 'region_admin'
          or v.branch_id = (select branch_id from public.current_profile())
        )
    )
  );

-- เปิดให้ upload รูปเข้า bucket valve-images ได้โดยไม่ต้อง login ไปก่อนเช่นกัน
drop policy if exists "valve_images_authenticated_write" on storage.objects;

create policy "valve_images_public_write" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'valve-images');
