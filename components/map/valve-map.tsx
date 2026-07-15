"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";

import { ValveWithBranch } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ใช้งาน: "#0ca30c",
  ไม่ได้ใช้งาน: "#d03b3b",
  ไม่ระบุ: "#94a3b8",
};

const STATUS_STYLES: Record<string, string> = {
  ใช้งาน: "bg-success-subtle text-success",
  ไม่ได้ใช้งาน: "bg-danger-subtle text-danger",
  ไม่ระบุ: "bg-neutral-subtle text-neutral",
};

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
          <Popup minWidth={240} maxWidth={280}>
            <div className="text-foreground">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-base font-bold text-foreground">
                    {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-xs font-medium text-primary">
                    {valve.brand} {valve.model ?? ""} · {valve.valve_type}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    STATUS_STYLES[valve.status] ?? STATUS_STYLES["ไม่ระบุ"]
                  )}
                >
                  {valve.status}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <div>📍 {valve.location ?? "ไม่ระบุตำแหน่ง"}</div>
                <div>🏢 {valve.branch.name}</div>
                <div>📅 ปีติดตั้ง {valve.install_year_be ?? "-"}</div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-border pt-2.5">
                <SpecMini label="Pressure In" value={valve.pressure_in != null ? `${valve.pressure_in} bar` : "-"} />
                <SpecMini label="Pressure Out" value={valve.pressure_out != null ? `${valve.pressure_out} bar` : "-"} />
                <SpecMini label="Flow Rate" value={valve.flow_rate != null ? `${valve.flow_rate}` : "-"} />
                <SpecMini label="ขนาด" value={valve.size_mm != null ? `${valve.size_mm} mm` : "-"} />
              </div>

              {valve.status !== "ใช้งาน" && valve.inactive_reason && (
                <div className="mt-2 rounded-md bg-surface-muted px-2 py-1.5 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">เหตุผล: </span>
                  {valve.inactive_reason}
                </div>
              )}

              {valve.remark && (
                <div className="mt-1.5 rounded-md bg-surface-muted px-2 py-1.5 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">หมายเหตุ: </span>
                  {valve.remark}
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function SpecMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
