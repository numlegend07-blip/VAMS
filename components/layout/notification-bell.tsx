"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { DueValve } from "@/lib/data/pm-history";

const MAX_VISIBLE = 15;

type Props = {
  dueValves: DueValve[];
};

export default function NotificationBell({ dueValves }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const overdueCount = dueValves.filter((v) => v.overdue).length;
  const dueSoonCount = dueValves.length - overdueCount;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="แจ้งเตือน PM"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground/70 transition-colors hover:border-primary hover:text-primary"
      >
        <Bell className="h-4 w-4" strokeWidth={2.25} />
        {dueValves.length > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9.5px] font-bold text-white",
              overdueCount > 0 ? "bg-danger" : "bg-warning"
            )}
          >
            {dueValves.length > 99 ? "99+" : dueValves.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-extrabold text-foreground">แจ้งเตือน PM</h3>
            <p className="text-[11px] text-muted-foreground">
              เกินกำหนด {overdueCount} · ใกล้ครบกำหนด {dueSoonCount}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {dueValves.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">ไม่มีรายการแจ้งเตือน</p>
            ) : (
              <ul className="divide-y divide-border">
                {dueValves.slice(0, MAX_VISIBLE).map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/valves/${v.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-foreground">
                          {v.asset_code ?? v.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {v.location ?? "-"} · {v.branch_name}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          v.overdue ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"
                        )}
                      >
                        {v.overdue ? `เกินกำหนด ${Math.abs(v.diff_days)} วัน` : `ใกล้ครบใน ${v.diff_days} วัน`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {dueValves.length > MAX_VISIBLE && (
            <div className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground">
              และอีก {dueValves.length - MAX_VISIBLE} รายการ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
