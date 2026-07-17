-- เพิ่มลิงก์เชิญเข้ากลุ่ม Telegram ต่อสาขา + กลุ่มกลางเขต 10
-- ใช้แสดงเป็นลิงก์/คิวอาร์โค้ดในหน้าเว็บ ให้พนักงานกดเข้าร่วมกลุ่มเองได้โดยไม่ต้องเชิญทีละคน
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor

alter table branches add column if not exists telegram_invite_link text;
alter table app_settings add column if not exists telegram_region_invite_link text;
