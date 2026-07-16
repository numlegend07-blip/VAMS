-- ขยายฟอร์มบันทึกซ่อมบำรุง (PM) ให้ครบตามหน้า "บันทึกข้อมูลการบำรุงรักษา"
-- เปลี่ยนประเภทงานจาก 3 เป็น 6 ตัวเลือก (ยังไม่มีข้อมูลจริงในตาราง ปลอดภัยที่จะเปลี่ยน)
-- เพิ่มค่าความดัน, รายละเอียดการปฏิบัติงาน, กำหนดบำรุงครั้งต่อไป, ชื่อผู้บันทึก (denormalized
-- เพื่อให้เพื่อนร่วมสาขาเห็นชื่อผู้ตรวจได้โดยไม่ต้องขยาย RLS ของตาราง profiles)
-- รันไฟล์นี้ต่อจาก 0005_employee_login.sql ใน Supabase SQL Editor

alter table pm_history drop constraint if exists pm_history_pm_type_check;
alter table pm_history add constraint pm_history_pm_type_check
  check (pm_type in (
    'ตรวจสอบประจำปี', 'ซ่อมบำรุงตามกำหนด', 'ซ่อมฉุกเฉิน',
    'เปลี่ยนชิ้นส่วน', 'ปรับตั้งค่า', 'ทดสอบการทำงาน'
  ));
alter table pm_history alter column pm_type set default 'ตรวจสอบประจำปี';

alter table pm_history add column if not exists pressure_in numeric;
alter table pm_history add column if not exists pressure_out numeric;
alter table pm_history add column if not exists set_point_original numeric;
alter table pm_history add column if not exists set_point_adjusted numeric;
alter table pm_history add column if not exists condition_found text;
alter table pm_history add column if not exists work_performed text;
alter table pm_history add column if not exists parts_used text;
alter table pm_history add column if not exists next_due_at date;
alter table pm_history add column if not exists created_by_name text;

-- สถานะวาล์ว ณ ตอนที่บันทึกครั้งนี้ (แยกจาก valves.status ซึ่งเป็นค่าปัจจุบันล่าสุด
-- ที่ถูกอัปเดตทับทุกครั้งที่มีการบันทึก PM ใหม่ — คอลัมน์นี้เก็บไว้ให้ประวัติแต่ละแถวถูกต้อง)
alter table pm_history add column if not exists status_after text
  check (status_after in ('ใช้งาน', 'ไม่ได้ใช้งาน', 'ไม่ระบุ'));
