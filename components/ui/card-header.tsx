import { cn } from "@/lib/utils";

const COLOR_STYLES = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-success-subtle text-success",
  danger: "bg-danger-subtle text-danger",
  warning: "bg-warning-subtle text-warning",
  purple: "bg-purple-subtle text-purple",
} as const;

type Props = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color?: keyof typeof COLOR_STYLES;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function CardHeader({ icon: Icon, color = "primary", title, subtitle, action }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4.5 py-4">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          COLOR_STYLES[color]
        )}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-extrabold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>

      {action}
    </div>
  );
}
