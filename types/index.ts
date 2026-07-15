export interface ControlValve {
  id: string;
  branch: string;
  valveType: string;
  brand: string;
  model?: string;
  size: string;

  status: "ใช้งาน" | "ไม่ได้ใช้งาน";

  location: string;

  latitude: number;
  longitude: number;

  installYear?: string;

  assetCode?: string;

  pressureIn?: number;

  pressureOut?: number;

  flowRate?: number;

  remark?: string;
}