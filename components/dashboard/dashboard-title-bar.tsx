import { ChevronDown, Building2, LayoutDashboard } from "lucide-react";

import { Branch } from "@/types";

type Props = {
  branches: Branch[];
  value: string | "all";
  onChange: (value: string | "all") => void;
};

export default function DashboardTitleBar({ branches, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
          <LayoutDashboard className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            ภาพรวมข้อมูลวาล์ว
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Overview Dashboard · การประปาส่วนภูมิภาค เขต 10
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
          <Building2 className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as string | "all")}
          className="appearance-none rounded-xl border border-border bg-surface-muted py-2.5 pl-10 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-subtle"
        >
          <option value="all">แสดงข้อมูลรวม (กปภ.ข.10)</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={2.25}
        />
      </div>
    </div>
  );
}
