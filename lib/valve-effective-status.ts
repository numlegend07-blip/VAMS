import { Valve } from "@/types";

// "ชำรุด" isn't its own value in valves.status — it's a valve marked ไม่ได้ใช้งาน whose
// inactive_reason says why. This derives the 3-way breakdown shown across the dashboard,
// charts, and map, without changing the underlying status enum.
export type EffectiveStatus = "ใช้งาน" | "ไม่ได้ใช้งาน" | "ชำรุด";

export function isBrokenReason(inactiveReason: string | null | undefined) {
  return Boolean(inactiveReason?.includes("ชำรุด"));
}

export function getEffectiveStatus(valve: Pick<Valve, "status" | "inactive_reason">): EffectiveStatus {
  if (valve.status === "ใช้งาน") return "ใช้งาน";
  if (valve.status === "ไม่ได้ใช้งาน" && isBrokenReason(valve.inactive_reason)) return "ชำรุด";
  return "ไม่ได้ใช้งาน";
}

export const EFFECTIVE_STATUS_COLORS: Record<EffectiveStatus, string> = {
  ใช้งาน: "#10b981",
  ไม่ได้ใช้งาน: "#8b5cf6",
  ชำรุด: "#ef4444",
};

export const EFFECTIVE_STATUS_LABEL: Record<EffectiveStatus, string> = {
  ใช้งาน: "✅ ใช้งานปกติ",
  ไม่ได้ใช้งาน: "🟣 ไม่ได้ใช้งาน",
  ชำรุด: "🔴 ชำรุด",
};

export const EFFECTIVE_STATUS_NAME: Record<EffectiveStatus, string> = {
  ใช้งาน: "ใช้งานปกติ",
  ไม่ได้ใช้งาน: "ไม่ได้ใช้งาน",
  ชำรุด: "ชำรุด",
};

export const EFFECTIVE_STATUS_TEXT_COLOR: Record<EffectiveStatus, string> = {
  ใช้งาน: "text-success",
  ไม่ได้ใช้งาน: "text-purple",
  ชำรุด: "text-danger",
};

export const EFFECTIVE_STATUS_BORDER_COLOR: Record<EffectiveStatus, string> = {
  ใช้งาน: "border-success",
  ไม่ได้ใช้งาน: "border-purple",
  ชำรุด: "border-danger",
};

export const EFFECTIVE_STATUS_BADGE: Record<EffectiveStatus, string> = {
  ใช้งาน: "bg-success-subtle text-success",
  ไม่ได้ใช้งาน: "bg-purple-subtle text-purple",
  ชำรุด: "bg-danger-subtle text-danger",
};
