import { ValveStatus } from "@/types";

export const STATUS_COLORS: Record<ValveStatus, string> = {
  ใช้งาน: "#10b981",
  ไม่ได้ใช้งาน: "#8b5cf6",
  ไม่ระบุ: "#ef4444",
};

export const STATUS_LABEL: Record<ValveStatus, string> = {
  ใช้งาน: "✅ ใช้งานปกติ",
  ไม่ได้ใช้งาน: "🟣 ไม่ได้ใช้งาน",
  ไม่ระบุ: "🔴 ชำรุด",
};

// plain text (no emoji) — for use next to a separate colored dot/swatch, to avoid double color indicators
export const STATUS_NAME: Record<ValveStatus, string> = {
  ใช้งาน: "ใช้งานปกติ",
  ไม่ได้ใช้งาน: "ไม่ได้ใช้งาน",
  ไม่ระบุ: "ชำรุด",
};

export const STATUS_TEXT_COLOR: Record<ValveStatus, string> = {
  ใช้งาน: "text-success",
  ไม่ได้ใช้งาน: "text-purple",
  ไม่ระบุ: "text-danger",
};

export const STATUS_BORDER_COLOR: Record<ValveStatus, string> = {
  ใช้งาน: "border-success",
  ไม่ได้ใช้งาน: "border-purple",
  ไม่ระบุ: "border-danger",
};

export const STATUS_BADGE: Record<ValveStatus, string> = {
  ใช้งาน: "bg-success-subtle text-success",
  ไม่ได้ใช้งาน: "bg-purple-subtle text-purple",
  ไม่ระบุ: "bg-danger-subtle text-danger",
};

export const STATUS_DOT: Record<ValveStatus, string> = {
  ใช้งาน: "bg-success",
  ไม่ได้ใช้งาน: "bg-purple",
  ไม่ระบุ: "bg-danger",
};
