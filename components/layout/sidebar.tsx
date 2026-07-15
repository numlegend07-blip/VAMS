"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  BarChart3,
  Settings,
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
    <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#0f1b3d] to-[#0a1330] md:flex">
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
        <Image
          src="/pwa-logo.jpg"
          alt="VAMS"
          width={64}
          height={64}
          className="rounded-full ring-2 ring-white/20"
          priority
        />
        <div>
          <div className="text-base font-bold leading-tight text-white">VAMS</div>
          <div className="mt-0.5 text-[11px] leading-tight text-blue-200/70">
            Valve Alert &amp; Maintenance System
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = item.href !== null && pathname.startsWith(item.href);

          if (!item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-blue-100/30"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  {item.label}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-blue-100/40">
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="text-xs font-semibold text-white">
            การประปาส่วนภูมิภาค
          </div>
          <div className="mt-0.5 text-[11px] text-blue-200/60">
            เขต 10 · 26 สาขา
          </div>
        </div>
      </div>
    </aside>
  );
}
