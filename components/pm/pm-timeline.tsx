import { Wrench } from "lucide-react";

export default function PMTimeline() {
  const history = [
    {
      date: "15 กรกฎาคม 2569",
      title: "ตรวจสอบแรงดัน",
      tone: { text: "text-success", ring: "ring-success-subtle", dot: "bg-success" },
    },
    {
      date: "20 มกราคม 2569",
      title: "เปลี่ยน Pilot Valve",
      tone: { text: "text-primary", ring: "ring-primary-subtle", dot: "bg-primary" },
    },
    {
      date: "18 สิงหาคม 2568",
      title: "ติดตั้งวาล์ว",
      tone: { text: "text-warning", ring: "ring-warning-subtle", dot: "bg-warning" },
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Wrench className="h-4 w-4 text-muted-foreground" strokeWidth={2.25} />
        ประวัติ PM
      </h2>

      <div className="mt-5 flex flex-col">
        {history.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`h-3 w-3 shrink-0 rounded-full ring-4 ${item.tone.dot} ${item.tone.ring}`} />
              {index !== history.length - 1 && (
                <span className="my-1 w-px flex-1 bg-border" />
              )}
            </div>

            <div className="pb-6 last:pb-0">
              <div className="text-xs text-muted-foreground">{item.date}</div>
              <div className="mt-0.5 text-sm font-medium text-foreground">
                {item.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
