import { ChevronDown, MapPin } from "lucide-react";

import { Branch } from "@/types";

type Props = {
  branches: Branch[];
  value: string | "all";
  onChange: (value: string | "all") => void;
  resultCount: number;
};

export default function BranchFilter({ branches, value, onChange, resultCount }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <MapPin className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <span className="text-sm font-medium text-foreground">กรองตามสาขา</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          แสดง {resultCount} รายการ
        </span>

        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as string | "all")}
            className="appearance-none rounded-lg border border-border bg-surface py-2 pl-3.5 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-subtle"
          >
            <option value="all">ทุกสาขา ({branches.length})</option>
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
    </div>
  );
}
