"use client";

import { useEffect, useState } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface-muted px-3.5 py-1.5 sm:flex">
      <ClockIcon className="h-3.75 w-3.75 text-muted-foreground" strokeWidth={2} />
      <div>
        <div className="font-display text-[15px] font-bold leading-none text-primary">
          {now ? now.toLocaleTimeString("th-TH", { hour12: false }) : "--:--:--"}
        </div>
        <div className="mt-0.5 text-[10px] leading-none text-muted-foreground">
          {now
            ? now.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "--"}
        </div>
      </div>
    </div>
  );
}
