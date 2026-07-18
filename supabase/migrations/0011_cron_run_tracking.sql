-- เก็บเวลาที่ cron แจ้งเตือน PM รันล่าสุด + สถานะ ไว้ตรวจสอบง่ายๆ จากในเว็บ
-- โดยไม่ต้องพึ่ง Vercel Logs ที่ดูย้อนหลังได้จำกัดตาม plan
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor

alter table app_settings add column if not exists last_alert_run_at timestamptz;
alter table app_settings add column if not exists last_alert_run_status text;
