// ผู้ดูแลระบบ VAMS — นายปภินวิชย์ แตงหอม รหัสพนักงาน 17816 กปภ.ข.10
// เฉพาะบัญชีนี้เท่านั้นที่จัดการหน้า "ตั้งค่า" (Telegram alerts) ได้ แม้บัญชี region_admin คนอื่นก็เข้าไม่ได้
export const SUPER_ADMIN_EMPLOYEE_CODE = "17816";

export function isSuperAdmin(employeeCode: string | null | undefined) {
  return employeeCode === SUPER_ADMIN_EMPLOYEE_CODE;
}
