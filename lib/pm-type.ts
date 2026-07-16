import { PMType } from "@/types";

export const PM_TYPES: PMType[] = [
  "ตรวจสอบประจำปี",
  "ซ่อมบำรุงตามกำหนด",
  "ซ่อมฉุกเฉิน",
  "เปลี่ยนชิ้นส่วน",
  "ปรับตั้งค่า",
  "ทดสอบการทำงาน",
];

export const PM_TYPE_STYLES: Record<PMType, string> = {
  ตรวจสอบประจำปี: "bg-primary-subtle text-primary",
  ซ่อมบำรุงตามกำหนด: "bg-success-subtle text-success",
  ซ่อมฉุกเฉิน: "bg-danger-subtle text-danger",
  เปลี่ยนชิ้นส่วน: "bg-warning-subtle text-warning",
  ปรับตั้งค่า: "bg-purple-subtle text-purple",
  ทดสอบการทำงาน: "bg-neutral-subtle text-neutral",
};

export const PM_TYPE_DOT: Record<PMType, string> = {
  ตรวจสอบประจำปี: "bg-primary",
  ซ่อมบำรุงตามกำหนด: "bg-success",
  ซ่อมฉุกเฉิน: "bg-danger",
  เปลี่ยนชิ้นส่วน: "bg-warning",
  ปรับตั้งค่า: "bg-purple",
  ทดสอบการทำงาน: "bg-neutral",
};
