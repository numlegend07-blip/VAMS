"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Wrench, Camera, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  valveId: string;
  hasCoordinates: boolean;
  hasPM: boolean;
  imageUrl: string | null;
  onPMClick: () => void;
  pmActive?: boolean;
};

type Dialog = { kind: "message"; text: string } | { kind: "photo"; url: string } | null;

export default function ActionButtons({
  valveId,
  hasCoordinates,
  hasPM,
  imageUrl,
  onPMClick,
  pmActive,
}: Props) {
  const [dialog, setDialog] = useState<Dialog>(null);

  const baseStyle =
    "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors";
  const idleStyle = "border-border bg-surface text-foreground hover:bg-surface-muted";

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {hasCoordinates ? (
          <Link href={`/valves/map?valve=${valveId}`} className={cn(baseStyle, idleStyle)}>
            <MapPin className="h-4 w-4" strokeWidth={2.25} />
            แผนที่
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setDialog({ kind: "message", text: "ยังไม่มีพิกัดของจุดติดตั้งนี้" })}
            className={cn(baseStyle, idleStyle)}
          >
            <MapPin className="h-4 w-4" strokeWidth={2.25} />
            แผนที่
          </button>
        )}

        <button
          type="button"
          onClick={() => (hasPM ? onPMClick() : setDialog({ kind: "message", text: "ไม่มีข้อมูล" }))}
          className={cn(
            baseStyle,
            pmActive ? "border-primary bg-primary text-primary-foreground" : idleStyle
          )}
        >
          <Wrench className="h-4 w-4" strokeWidth={2.25} />
          ประวัติ PM
        </button>

        <button
          type="button"
          onClick={() =>
            imageUrl
              ? setDialog({ kind: "photo", url: imageUrl })
              : setDialog({ kind: "message", text: "ไม่มีข้อมูล" })
          }
          className={cn(baseStyle, idleStyle)}
        >
          <Camera className="h-4 w-4" strokeWidth={2.25} />
          รูปภาพ
        </button>
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4"
          onClick={() => setDialog(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            {dialog.kind === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dialog.url} alt="รูปภาพวาล์ว" className="max-h-[80vh] w-full object-contain" />
            ) : (
              <p className="px-6 py-10 text-center text-sm font-medium text-foreground">{dialog.text}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
