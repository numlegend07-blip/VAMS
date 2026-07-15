"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useTheme } from "next-themes";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

import { ValveWithBranch } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  ใช้งาน: "#0ca30c",
  ไม่ได้ใช้งาน: "#d03b3b",
  ไม่ระบุ: "#94a3b8",
};

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

type Props = {
  valves: ValveWithBranch[];
};

export default function ValveMap({ valves }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const points = valves
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({ ...v, latitude: v.latitude as number, longitude: v.longitude as number }));

  const bounds = points.map((v) => [v.latitude, v.longitude] as [number, number]);

  return (
    <MapContainer
      bounds={bounds.length > 0 ? bounds : undefined}
      center={bounds.length === 0 ? [16.5, 100.5] : undefined}
      zoom={bounds.length === 0 ? 8 : undefined}
      boundsOptions={{ padding: [30, 30] }}
      style={{ height: "100%", width: "100%", background: "var(--surface-muted)" }}
    >
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
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {valve.asset_code || valve.id.slice(0, 8).toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>
                {valve.brand} · {valve.valve_type}
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 600,
                    color: STATUS_COLORS[valve.status] ?? STATUS_COLORS["ไม่ระบุ"],
                  }}
                >
                  ● {valve.status}
                </span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: "#475569" }}>
                📍 {valve.location ?? "ไม่ระบุตำแหน่ง"}
              </div>
              <div style={{ fontSize: 12, color: "#475569" }}>
                🏢 {valve.branch.name}
              </div>
              <Link
                href={`/valves/${valve.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2563eb",
                  textDecoration: "underline",
                }}
              >
                ดูรายละเอียดทั้งหมด →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
