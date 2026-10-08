"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Wrench, Camera, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  valveId: string;
  hasCoordinates: boolean;
  hasPM: boolean;
  imageUrls: string[];
  onPMClick: () => void;
  pmActive?: boolean;
};

type Dialog = { kind: "message"; text: string } | { kind: "photo"; index: number } | null;

export default function ActionButtons({
  valveId,
  hasCoordinates,
  hasPM,
  imageUrls,
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
            imageUrls.length > 0
              ? setDialog({ kind: "photo", index: 0 })
              : setDialog({ kind: "message", text: "ไม่มีข้อมูล" })
          }
          className={cn(baseStyle, idleStyle)}
        >
          <Camera className="h-4 w-4" strokeWidth={2.25} />
          รูปภาพ{imageUrls.length > 0 ? ` (${imageUrls.length})` : ""}
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
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrls[dialog.index]}
                  alt="รูปภาพวาล์ว"
                  className="max-h-[80vh] w-full object-contain"
                />

                {imageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setDialog({ kind: "photo", index: (dialog.index - 1 + imageUrls.length) % imageUrls.length })
                      }
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: "photo", index: (dialog.index + 1) % imageUrls.length })}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                      {dialog.index + 1} / {imageUrls.length}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <p className="px-6 py-10 text-center text-sm font-medium text-foreground">{dialog.text}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
