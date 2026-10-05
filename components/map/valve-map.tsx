"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import { Camera, Check, Loader2, Trash2, X as XIcon } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createClient } from "@/lib/supabase/client";
import { ValveWithBranch } from "@/types";
import { cn } from "@/lib/utils";
import {
  EFFECTIVE_STATUS_COLORS,
  EFFECTIVE_STATUS_LABEL,
  EFFECTIVE_STATUS_TEXT_COLOR,
  EFFECTIVE_STATUS_BORDER_COLOR,
  getEffectiveStatus,
} from "@/lib/valve-effective-status";

const LIGHT_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const DARK_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";

function statusIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.15);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

const STATUS_ICONS = {
  ใช้งาน: statusIcon(EFFECTIVE_STATUS_COLORS["ใช้งาน"]),
  ไม่ได้ใช้งาน: statusIcon(EFFECTIVE_STATUS_COLORS["ไม่ได้ใช้งาน"]),
  ชำรุด: statusIcon(EFFECTIVE_STATUS_COLORS["ชำรุด"]),
};

type Props = {
  valves: ValveWithBranch[];
  editable?: boolean;
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

export default function ValveMap({ valves, editable = false }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [positions, setPositions] = useState<Record<string, [number, number]>>({});
  const [confirming, setConfirming] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "saving" | "error" | undefined>>({});

  const points = valves
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({ ...v, latitude: v.latitude as number, longitude: v.longitude as number }));

  const bounds = points.map((v) => [v.latitude, v.longitude] as [number, number]);

  async function handleSavePosition(id: string) {
    const pos = positions[id];
    if (!pos) return;

    setSaveStatus((s) => ({ ...s, [id]: "saving" }));
    const supabase = createClient();
    const { error } = await supabase
      .from("valves")
      .update({ latitude: pos[0], longitude: pos[1] })
      .eq("id", id);

    if (error) {
      setSaveStatus((s) => ({ ...s, [id]: "error" }));
      return;
    }

    setSaveStatus((s) => ({ ...s, [id]: undefined }));
    setConfirming((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleCancelPosition(id: string) {
    setPositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setConfirming((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSaveStatus((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <MapContainer
      center={[16.5, 100.5]}
      zoom={8}
      style={{ height: "100%", width: "100%", background: "var(--surface-muted)" }}
    >
      <FitBounds bounds={bounds} />

      <TileLayer
        url={isDark ? DARK_TILES : LIGHT_TILES}
        attribution='&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {points.map((valve) => {
        const effective = getEffectiveStatus(valve);
        const position = positions[valve.id] ?? [valve.latitude, valve.longitude];
        const isPending = confirming[valve.id] ?? false;
        const status = saveStatus[valve.id];

        return (
        <Marker
          key={valve.id}
          position={position}
          icon={STATUS_ICONS[effective]}
          draggable={editable}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat, lng } = marker.getLatLng();
              setPositions((prev) => ({ ...prev, [valve.id]: [lat, lng] }));
              setConfirming((prev) => ({ ...prev, [valve.id]: true }));
              marker.openPopup();
            },
          }}
        >
          <Popup minWidth={220} maxWidth={280}>
            {editable && isPending && (
              <div className="mb-2.5 rounded-lg border border-warning/40 bg-warning-subtle p-2.5">
                <div className="text-[11px] font-bold text-foreground">ตำแหน่งใหม่ที่ลากไว้</div>
                <div className="text-[10.5px] text-muted-foreground">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSavePosition(valve.id)}
                    disabled={status === "saving"}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {status === "saving" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    )}
                    บันทึกตำแหน่งใหม่
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelPosition(valve.id)}
                    disabled={status === "saving"}
                    className="flex items-center justify-center gap-1 rounded-md border border-border py-1 px-2 text-[11px] font-semibold text-foreground disabled:opacity-60"
                  >
                    <XIcon className="h-3 w-3" strokeWidth={2.5} />
                    ยกเลิก
                  </button>
                </div>
                {status === "error" && (
                  <p className="mt-1 text-[10.5px] text-danger">บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง</p>
                )}
              </div>
            )}

            <div className="text-foreground">
              <div
                className={cn(
                  "mb-2 border-b-2 pb-1.5 text-sm font-extrabold",
                  EFFECTIVE_STATUS_BORDER_COLOR[effective]
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
                    value={EFFECTIVE_STATUS_LABEL[effective]}
                    valueClassName={cn("font-extrabold", EFFECTIVE_STATUS_TEXT_COLOR[effective])}
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
        </Marker>
        );
      })}
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("ลบรูปภาพนี้ใช่หรือไม่?")) return;

    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("valves")
        .update({ image_url: null })
        .eq("id", valve.id);
      if (updateError) throw new Error(updateError.message);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบรูปไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  }

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

      <div className="mt-1.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || deleting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
          )}
          {uploading ? "กำลังอัปโหลด..." : valve.image_url ? "อัปเดตรูปภาพ" : "ถ่าย/แนบรูปภาพ"}
        </button>

        {valve.image_url && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading || deleting}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-danger transition-colors hover:border-danger hover:bg-danger-subtle disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
            ลบรูป
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-[10.5px] text-danger">{error}</p>}
    </div>
  );
}
