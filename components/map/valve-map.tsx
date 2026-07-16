"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";

import { ValveWithBranch } from "@/types";
import { cn } from "@/lib/utils";
import {
  STATUS_COLORS,
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
  STATUS_BORDER_COLOR,
} from "@/lib/valve-status";

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

type Props = {
  valves: ValveWithBranch[];
};

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (bounds.length === 0) return;
    if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, bounds]);

  return null;
}

export default function ValveMap({ valves }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const points = valves
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({ ...v, latitude: v.latitude as number, longitude: v.longitude as number }));

  const bounds = points.map((v) => [v.latitude, v.longitude] as [number, number]);

  return (
    <MapContainer
      center={[16.5, 100.5]}
      zoom={8}
      style={{ height: "100%", width: "100%", background: "var(--surface-muted)" }}
    >
      <FitBounds bounds={bounds} />

      <TileLayer
        url={isDark ? DARK_TILES : LIGHT_TILES}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {points.map((valve) => (
        <CircleMarker
          key={valve.id}
          center={[valve.latitude, valve.longitude]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: STATUS_COLORS[valve.status] ?? STATUS_COLORS["ไม่ระบุ"],
            fillOpacity: 1,
          }}
        >
          <Popup minWidth={220} maxWidth={280}>
            <div className="text-foreground">
              <div
                className={cn(
                  "mb-2 border-b-2 pb-1.5 text-sm font-extrabold",
                  STATUS_BORDER_COLOR[valve.status] ?? STATUS_BORDER_COLOR["ไม่ระบุ"]
                )}
              >
                🔧 {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
              </div>

              <div className="mb-2 text-xs font-bold text-foreground">
                {valve.location ?? "ไม่ระบุตำแหน่ง"}
              </div>

              <table className="w-full border-collapse text-[11.5px]">
                <tbody>
                  <SpecRow label="สาขา" value={valve.branch.name} valueClassName="font-bold text-primary" />
                  <SpecRow label="ชนิด" value={valve.valve_type || "-"} />
                  <SpecRow
                    label="ยี่ห้อ/ขนาด"
                    value={`${valve.brand || "-"}${valve.size_mm ? ` ${valve.size_mm} มม.` : ""}`}
                  />
                  <SpecRow label="ปีติดตั้ง" value={valve.install_year_be ? String(valve.install_year_be) : "-"} />
                  <SpecRow label="รหัสพัสดุ" value={valve.asset_code || "-"} />
                  <SpecRow label="ตรวจล่าสุด" value="ยังไม่ตรวจ" />
                  <SpecRow
                    label="สถานะ"
                    value={STATUS_LABEL[valve.status] ?? "-"}
                    valueClassName={cn("font-extrabold", STATUS_TEXT_COLOR[valve.status])}
                  />
                  {valve.status !== "ใช้งาน" && valve.inactive_reason && (
                    <SpecRow label="เหตุผล" value={valve.inactive_reason} valueClassName="font-semibold text-warning" />
                  )}
                </tbody>
              </table>

              {valve.remark && (
                <div className="mt-1.5 text-[11px] italic text-muted-foreground">
                  หมายเหตุ: {valve.remark}
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function SpecRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <tr>
      <td className="py-0.5 pr-3 align-top text-muted-foreground">{label}</td>
      <td className={cn("py-0.5 align-top font-semibold text-foreground", valueClassName)}>{value}</td>
    </tr>
  );
}
