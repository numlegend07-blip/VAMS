import { Wrench } from "lucide-react";

import { PMRecord, PMType } from "@/types";
import { cn } from "@/lib/utils";

const PM_TYPE_STYLES: Record<PMType, string> = {
  ตรวจสอบ: "bg-primary-subtle text-primary",
  ซ่อมบำรุง: "bg-danger-subtle text-danger",
  เปลี่ยนอะไหล่: "bg-warning-subtle text-warning",
};

const PM_TYPE_DOT: Record<PMType, string> = {
  ตรวจสอบ: "bg-primary",
  ซ่อมบำรุง: "bg-danger",
  เปลี่ยนอะไหล่: "bg-warning",
};

function formatThaiDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    calendar: "buddhist",
  });
}

type Props = {
  records: PMRecord[];
};

export default function PMTimeline({ records }: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Wrench className="h-4 w-4 text-muted-foreground" strokeWidth={2.25} />
        ประวัติ PM
      </h2>

      {records.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีบันทึก PM สำหรับวาล์วนี้</p>
      ) : (
        <div className="mt-5 flex flex-col">
          {records.map((record, index) => (
            <div key={record.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={cn("h-3 w-3 shrink-0 rounded-full", PM_TYPE_DOT[record.pm_type])} />
                {index !== records.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-border" />
                )}
              </div>

              <div className="pb-6 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatThaiDate(record.performed_at)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      PM_TYPE_STYLES[record.pm_type]
                    )}
                  >
                    {record.pm_type}
                  </span>
                </div>

                <div className="mt-1 text-sm font-medium text-foreground">
                  {record.title}
                </div>

                {record.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{record.description}</p>
                )}

                {(record.photo_before_url || record.photo_after_url) && (
                  <div className="mt-2.5 flex gap-3">
                    {record.photo_before_url && (
                      <PhotoThumb url={record.photo_before_url} label="ก่อนทำ" />
                    )}
                    {record.photo_after_url && (
                      <PhotoThumb url={record.photo_after_url} label="หลังทำ" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoThumb({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="h-20 w-28 rounded-lg border border-border object-cover"
      />
      <span className="mt-1 block text-center text-[10px] text-muted-foreground">
        {label}
      </span>
    </a>
  );
}
