import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBox({
  value,
  onChange,
}: SearchBoxProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2.25}
      />
      <input
        type="text"
        placeholder="ค้นหารหัส / สาขา / ยี่ห้อ..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary-subtle"
      />
    </div>
  );
}
