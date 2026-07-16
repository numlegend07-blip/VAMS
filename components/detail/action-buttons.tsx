import { MapPin, Wrench, Camera, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  onPMClick: () => void;
  pmActive?: boolean;
};

export default function ActionButtons({ onPMClick, pmActive }: Props) {
  const baseStyle =
    "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={cn(
          baseStyle,
          "border-border bg-surface text-foreground hover:bg-surface-muted"
        )}
      >
        <MapPin className="h-4 w-4" strokeWidth={2.25} />
        แผนที่
      </button>

      <button
        onClick={onPMClick}
        className={cn(
          baseStyle,
          pmActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface text-foreground hover:bg-surface-muted"
        )}
      >
        <Wrench className="h-4 w-4" strokeWidth={2.25} />
        ประวัติ PM
      </button>

      <button
        className={cn(
          baseStyle,
          "border-border bg-surface text-foreground hover:bg-surface-muted"
        )}
      >
        <Camera className="h-4 w-4" strokeWidth={2.25} />
        รูปภาพ
      </button>

      <button
        className={cn(
          baseStyle,
          "border-border bg-surface text-foreground hover:bg-surface-muted"
        )}
      >
        <FileText className="h-4 w-4" strokeWidth={2.25} />
        เอกสาร
      </button>
    </div>
  );
}
