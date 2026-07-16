import { ValveStatus } from "@/types";

export const STATUS_COLORS: Record<ValveStatus, string> = {
  ใช้งาน: "#10b981",
  ไม่ได้ใช้งาน: "#ef4444",
  ไม่ระบุ: "#8b5cf6",
};

export const STATUS_LABEL: Record<ValveStatus, string> = {
  ใช้งาน: "✅ ใช้งานปกติ",
  ไม่ได้ใช้งาน: "🔴 ไม่ได้ใช้งาน",
  ไม่ระบุ: "🟣 ไม่ระบุสถานะ",
};

export const STATUS_TEXT_COLOR: Record<ValveStatus, string> = {
  ใช้งาน: "text-success",
  ไม่ได้ใช้งาน: "text-danger",
  ไม่ระบุ: "text-purple",
};

export const STATUS_BORDER_COLOR: Record<ValveStatus, string> = {
  ใช้งาน: "border-success",
  ไม่ได้ใช้งาน: "border-danger",
  ไม่ระบุ: "border-purple",
};

export const STATUS_BADGE: Record<ValveStatus, string> = {
  ใช้งาน: "bg-success-subtle text-success",
  ไม่ได้ใช้งาน: "bg-danger-subtle text-danger",
  ไม่ระบุ: "bg-purple-subtle text-purple",
};

export const STATUS_DOT: Record<ValveStatus, string> = {
  ใช้งาน: "bg-success",
  ไม่ได้ใช้งาน: "bg-danger",
  ไม่ระบุ: "bg-purple",
};
