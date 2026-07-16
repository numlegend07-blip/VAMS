"use client";

import { useRouter, usePathname } from "next/navigation";
import { Menu, RotateCw, UserRound } from "lucide-react";

import ThemeToggle from "./theme-toggle";
import Clock from "./clock";

const TITLES: Record<string, string> = {
  "/valves": "แดชบอร์ดภาพรวม",
  "/valves/map": "แผนที่จุดติดตั้ง",
};

type Props = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/valves/") && !pathname.startsWith("/valves/map")
      ? "รายละเอียดวาล์ว"
      : "VAMS");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="เปิดเมนู"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground/70 transition-colors hover:border-primary hover:text-primary md:hidden"
      >
        <Menu className="h-4.5 w-4.5" strokeWidth={2.25} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-extrabold text-foreground">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          VAMS — ระบบบริหารจัดการ Control Valve การประปาส่วนภูมิภาค เขต 10
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Clock />

        <button
          type="button"
          onClick={() => router.refresh()}
          title="รีเฟรช"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground/70 transition-colors hover:border-primary hover:text-primary"
        >
          <RotateCw className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <ThemeToggle />

        <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <UserRound className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <span className="hidden text-xs font-medium text-foreground sm:inline">Admin</span>
        </div>
      </div>
    </header>
  );
}
