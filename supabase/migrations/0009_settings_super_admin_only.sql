-- จำกัดสิทธิ์แก้ไข app_settings (ตั้งค่า Telegram ส่วนกลาง) ให้เฉพาะผู้ดูแลระบบคนเดียว
-- (นายปภินวิชย์ แตงหอม รหัสพนักงาน 17816) แทนที่จะเปิดให้ region_admin ทุกบัญชีแก้ไขได้
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor

drop policy if exists "app_settings_write" on app_settings;
create policy "app_settings_write" on app_settings
  for update to authenticated
  using ((select employee_code from profiles where id = auth.uid()) = '17816')
  with check ((select employee_code from profiles where id = auth.uid()) = '17816');
