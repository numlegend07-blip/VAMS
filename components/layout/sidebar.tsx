"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  History,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/auth";
import { Profile } from "@/types";

const RESERVED_SUBROUTES = ["/valves/map", "/valves/pm", "/valves/history"];

type NavItem = {
  label: string;
  href: string | null;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  disabledBadge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

function getSections(canManageSettings: boolean): NavSection[] {
  return [
    {
      label: "เมนูหลัก",
      items: [
        { label: "แดชบอร์ด", href: "/valves", icon: LayoutDashboard },
        { label: "แผนที่จุดติดตั้ง", href: "/valves/map", icon: Map },
      ],
    },
    {
      label: "รายงาน & ติดตาม",
      items: [
        { label: "บันทึกซ่อมบำรุง (PM)", href: "/valves/pm", icon: ClipboardList },
        { label: "ประวัติการบำรุงรักษา", href: "/valves/history", icon: History },
        { label: "รายงาน", href: null, icon: BarChart3 },
      ],
    },
    {
      label: "ระบบ",
      items: [
        {
          label: "ตั้งค่า",
          href: canManageSettings ? "/valves/settings" : null,
          icon: Settings,
          disabledBadge: "สำหรับผู้ดูแลระบบ",
        },
      ],
    },
  ];
}

type Props = {
  open?: boolean;
  onClose?: () => void;
  profile: Profile | null;
};

export default function Sidebar({ open = false, onClose, profile }: Props) {
  const pathname = usePathname();
  const sections = getSections(isSuperAdmin(profile?.employee_code));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-67 shrink-0 flex-col border-r border-border bg-surface shadow-lg transition-transform duration-300 md:sticky md:top-0 md:z-0 md:h-screen md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-4.5">
          <Image
            src="/pwa-logo.jpg"
            alt="VAMS"
            width={42}
            height={42}
            className="shrink-0 rounded-lg"
            priority
          />
          <div className="min-w-0">
            <div className="truncate text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              การประปาส่วนภูมิภาค เขต 10
            </div>
            <div className="text-[14px] font-extrabold leading-tight tracking-tight text-primary">
              VAMS
            </div>
            <div className="truncate text-[9px] leading-tight text-muted-foreground">
              Valve Alert &amp; Maintenance System
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pb-2">
          {sections.map((section) => (
            <div key={section.label} className="px-2.5 pt-2.5">
              <div className="px-2 pb-1.5 text-[9.5px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {section.label}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/valves"
                    ? pathname === "/valves" ||
                      (pathname.startsWith("/valves/") &&
                        !RESERVED_SUBROUTES.some((route) => pathname.startsWith(route)))
                    : item.href !== null && pathname.startsWith(item.href);

                if (!item.href) {
                  return (
                    <div
                      key={item.label}
                      className="mb-px flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-muted-foreground/50"
                    >
                      <Icon className="h-4.25 w-4.25 shrink-0" strokeWidth={2} />
                      <span className="flex-1">{item.label}</span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[9.5px] font-bold text-muted-foreground">
                        {item.disabledBadge ?? "เร็วๆ นี้"}
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "relative mb-px flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-primary-subtle text-primary"
                        : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-3/5 w-0.75 -translate-y-1/2 rounded-r-[3px] bg-primary" />
                    )}
                    <Icon className="h-4.25 w-4.25 shrink-0" strokeWidth={2.25} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3.5">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-hover text-white">
              <Building2 className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-foreground">
                {profile?.role === "region_admin"
                  ? "การประปาส่วนภูมิภาค เขต 10"
                  : (profile?.branch?.name ?? "การประปาส่วนภูมิภาค")}
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {profile?.role === "region_admin" ? "ภาพรวมทุกสาขา" : "เขต 10"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
