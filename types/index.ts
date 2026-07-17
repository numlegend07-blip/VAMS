export interface Branch {
  id: string;
  name: string;
  note: string | null;
  telegram_chat_id: string | null;
  created_at: string;
}

export interface AppSettings {
  telegram_region_chat_id: string | null;
}

export type ValveStatus = "ใช้งาน" | "ไม่ได้ใช้งาน" | "ไม่ระบุ";

export interface Valve {
  id: string;
  branch_id: string;
  seq_no: number | null;

  valve_type: string;
  brand: string;
  model: string | null;
  size_mm: number | null;

  status: ValveStatus;
  inactive_reason: string | null;

  location: string | null;
  latitude: number | null;
  longitude: number | null;

  install_year_be: number | null;
  asset_code: string | null;
  remark: string | null;

  pressure_in: number | null;
  pressure_out: number | null;
  flow_rate: number | null;

  image_url: string | null;

  created_at: string;
  updated_at: string;
}

export interface ValveWithBranch extends Valve {
  branch: Pick<Branch, "id" | "name">;
}

export type ProfileRole = "region_admin" | "branch_staff";

export interface Profile {
  id: string;
  employee_code: string | null;
  full_name: string | null;
  position: string | null;
  department: string | null;
  role: ProfileRole;
  branch_id: string | null;
  branch: Pick<Branch, "id" | "name"> | null;
}

export type PMType =
  | "ตรวจสอบประจำปี"
  | "ซ่อมบำรุงตามกำหนด"
  | "ซ่อมฉุกเฉิน"
  | "เปลี่ยนชิ้นส่วน"
  | "ปรับตั้งค่า"
  | "ทดสอบการทำงาน";

export interface PMRecord {
  id: string;
  valve_id: string;
  performed_at: string;
  title: string;
  description: string | null;
  pm_type: PMType;
  photo_before_url: string | null;
  photo_after_url: string | null;

  pressure_in: number | null;
  pressure_out: number | null;
  set_point_original: number | null;
  set_point_adjusted: number | null;
  condition_found: string | null;
  work_performed: string | null;
  parts_used: string | null;
  next_due_at: string | null;
  status_after: ValveStatus | null;

  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface PMRecordWithValve extends PMRecord {
  valve: Pick<Valve, "id" | "asset_code" | "location" | "branch_id" | "status"> & {
    branch: Pick<Branch, "id" | "name">;
  };
}
