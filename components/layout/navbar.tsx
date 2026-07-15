import Image from "next/image";
import { UserRound } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 px-5 py-3.5 backdrop-blur supports-[backdrop-filter]:bg-surface/60 md:px-8">
      <div className="flex items-center gap-2.5 md:hidden">
        <Image src="/pwa-logo.jpg" alt="VAMS" width={32} height={32} className="rounded-full" priority />
        <span className="text-sm font-bold text-foreground">VAMS</span>
      </div>

      <div className="hidden md:block">
        <div className="text-sm font-semibold text-foreground">
          Valve Alert &amp; Maintenance System
        </div>
        <div className="text-xs text-muted-foreground">
          ระบบบริหารจัดการ Control Valve การประปาส่วนภูมิภาค เขต 10
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <UserRound className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <span className="text-xs font-medium text-foreground">Admin</span>
      </div>
    </header>
  );
}
