-- ระบบ login พนักงานด้วยรหัสพนักงาน + รหัสผ่าน
-- ปิดช่องทางสาธารณะที่เปิดไว้ชั่วคราวใน 0002 (อ่านได้ทุกคน) และ 0003/0004 (เพิ่มข้อมูลได้ทุกคน)
-- เพราะตอนนี้มีระบบ login แล้ว ตามที่ comment ไว้ในไฟล์ก่อนหน้า
-- รันไฟล์นี้ต่อจาก 0004_valves_public_insert.sql ใน Supabase SQL Editor

-- ============================================================
-- 1. เพิ่มคอลัมน์ profiles สำหรับข้อมูลพนักงาน
-- ============================================================
alter table profiles add column if not exists employee_code text unique;
alter table profiles add column if not exists position text;
alter table profiles add column if not exists department text;

-- ============================================================
-- 2. ปิดสิทธิ์อ่านสาธารณะ (0002) — ต้อง login และเห็นเฉพาะสาขาตัวเอง
--    (region_admin ที่ branch_id เป็น null จะเห็นทุกสาขา)
-- ============================================================
drop policy if exists "branches_select" on branches;
create policy "branches_select" on branches
  for select to authenticated
  using (
    (select role from public.current_profile()) = 'region_admin'
    or id = (select branch_id from public.current_profile())
  );

drop policy if exists "valves_select" on valves;
create policy "valves_select" on valves
  for select to authenticated
  using (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  );

drop policy if exists "pm_history_select" on pm_history;
create policy "pm_history_select" on pm_history
  for select to authenticated
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

-- ============================================================
-- 3. ปิดสิทธิ์เพิ่มข้อมูลสาธารณะ (0003, 0004) — ต้อง login และเพิ่มได้
--    เฉพาะสาขาตัวเอง (region_admin เพิ่มได้ทุกสาขา)
-- ============================================================
drop policy if exists "valves_insert" on valves;
create policy "valves_insert" on valves
  for insert to authenticated
  with check (
    (select role from public.current_profile()) = 'region_admin'
    or branch_id = (select branch_id from public.current_profile())
  );

drop policy if exists "pm_history_insert" on pm_history;
create policy "pm_history_insert" on pm_history
  for insert to authenticated
  with check (
    exists (
      select 1 from valves v
      where v.id = pm_history.valve_id
        and (
          (select role from public.current_profile()) = 'region_admin'
          or v.branch_id = (select branch_id from public.current_profile())
        )
    )
  );

drop policy if exists "valve_images_public_write" on storage.objects;
drop policy if exists "valve_images_authenticated_write" on storage.objects;
create policy "valve_images_authenticated_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'valve-images');
