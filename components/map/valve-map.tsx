"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import { Camera, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { createClient } from "@/lib/supabase/client";
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

              <ValvePhotoBlock valve={valve} />
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

function ValvePhotoBlock({ valve }: { valve: ValveWithBranch }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `valves/${valve.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("valve-images")
        .upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = supabase.storage.from("valve-images").getPublicUrl(path).data.publicUrl;

      const { error: updateError } = await supabase
        .from("valves")
        .update({ image_url: publicUrl })
        .eq("id", valve.id);
      if (updateError) throw new Error(updateError.message);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {valve.image_url ? (
        <a href={valve.image_url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={valve.image_url}
            alt={valve.location ?? valve.asset_code ?? "valve"}
            className="h-24 w-full rounded-lg border border-border object-cover"
          />
        </a>
      ) : (
        <div className="flex h-14 w-full items-center justify-center rounded-lg border border-dashed border-border text-[10.5px] text-muted-foreground">
          ยังไม่มีรูปภาพ
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
        )}
        {uploading ? "กำลังอัปโหลด..." : valve.image_url ? "อัปเดตรูปภาพ" : "ถ่าย/แนบรูปภาพ"}
      </button>

      {error && <p className="mt-1 text-[10.5px] text-danger">{error}</p>}
    </div>
  );
}
