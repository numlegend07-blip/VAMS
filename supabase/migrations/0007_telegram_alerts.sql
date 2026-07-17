-- ระบบแจ้งเตือน PM ค้างกำหนดผ่าน Telegram (สรุปรายวัน)
-- เพิ่มช่องเก็บ Telegram chat id ต่อสาขา + ตาราง settings ส่วนกลางสำหรับ chat id ระดับเขต
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor

alter table branches add column if not exists telegram_chat_id text;

create table if not exists app_settings (
  id int primary key default 1 check (id = 1),
  telegram_region_chat_id text,
  updated_at timestamptz not null default now()
);

insert into app_settings (id) values (1) on conflict (id) do nothing;

alter table app_settings enable row level security;

-- ใครที่ login แล้วอ่านค่าได้ (ใช้แสดงในหน้าตั้งค่า), แก้ไขได้เฉพาะ region_admin
drop policy if exists "app_settings_select" on app_settings;
create policy "app_settings_select" on app_settings
  for select to authenticated using (true);

drop policy if exists "app_settings_write" on app_settings;
create policy "app_settings_write" on app_settings
  for update to authenticated
  using ((select role from public.current_profile()) = 'region_admin')
  with check ((select role from public.current_profile()) = 'region_admin');
