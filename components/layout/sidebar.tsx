"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  BarChart3,
  Settings,
  Droplets,
} from "lucide-react";

import { cn } from "@/lib/utils";

const menu = [
  { label: "Dashboard", href: "/valves", icon: LayoutDashboard },
  { label: "PM", href: null, icon: ClipboardList },
  { label: "แผนที่", href: null, icon: Map },
  { label: "รายงาน", href: null, icon: BarChart3 },
  { label: "ตั้งค่า", href: null, icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Droplets className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-foreground">VAMS</div>
          <div className="text-[11px] leading-tight text-muted-foreground">เขต 10</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = item.href !== null && pathname.startsWith(item.href);

          if (!item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground/60"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  {item.label}
                </span>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  เร็วๆ นี้
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-subtle text-primary"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-surface-muted p-3">
          <div className="text-xs font-semibold text-foreground">
            การประปาส่วนภูมิภาค
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            เขต 10 · 26 สาขา
          </div>
        </div>
      </div>
    </aside>
  );
}
