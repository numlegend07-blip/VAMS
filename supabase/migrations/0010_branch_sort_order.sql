-- เรียงลำดับสาขาตามลำดับไฟล์จริง (นครสวรรค์ = 1 ... วิเชียรบุรี = 26)
-- แทนการเรียงตามตัวอักษร ก-ฮ แบบเดิม ใช้กับดรอปดาวน์/กราฟ/รายการสาขาทุกจุดในเว็บ
-- รันไฟล์นี้ทั้งหมดใน Supabase Dashboard > SQL Editor

alter table branches add column if not exists sort_order int;

update branches set sort_order = case name
  when 'นครสวรรค์' then 1
  when 'ท่าตะโก' then 2
  when 'ลาดยาว' then 3
  when 'พยุหะคีรี' then 4
  when 'ชัยนาท' then 5
  when 'อุทัยธานี' then 6
  when 'ขาณุวรลักษบุรี' then 7
  when 'กำแพงเพชร' then 8
  when 'ตาก' then 9
  when 'แม่สอด' then 10
  when 'สุโขทัย' then 11
  when 'ทุ่งเสลี่ยม' then 12
  when 'ศรีสำโรง' then 13
  when 'สวรรคโลก' then 14
  when 'ศรีสัชนาลัย' then 15
  when 'อุตรดิตถ์' then 16
  when 'พิษณุโลก' then 17
  when 'นครไทย' then 18
  when 'พิจิตร' then 19
  when 'บางมูลนาก' then 20
  when 'ตะพานหิน' then 21
  when 'เพชรบูรณ์' then 22
  when 'หล่มสัก' then 23
  when 'ชนแดน' then 24
  when 'หนองไผ่' then 25
  when 'วิเชียรบุรี' then 26
  else sort_order
end;
