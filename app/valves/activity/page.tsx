import { redirect } from "next/navigation";
import { ListChecks } from "lucide-react";

import { getCurrentProfile } from "@/lib/data/profile";
import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";
import { isSuperAdmin } from "@/lib/auth";
import { formatThaiDate } from "@/lib/format";
import CardHeader from "@/components/ui/card-header";
import { cn } from "@/lib/utils";

export default async function ActivityPage() {
  const profile = await getCurrentProfile();
  if (!isSuperAdmin(profile?.employee_code)) {
    redirect("/valves");
  }

  const [valves, branches] = await Promise.all([getValves(), getBranches()]);

  const rows = branches
    .map((branch) => {
      const branchValves = valves.filter((v) => v.branch_id === branch.id);
      const edited = branchValves.filter(
        (v) => new Date(v.updated_at).getTime() - new Date(v.created_at).getTime() > 1000
      );
      const lastUpdatedAt = branchValves.reduce<string | null>((latest, v) => {
        if (!latest || new Date(v.updated_at) > new Date(latest)) return v.updated_at;
        return latest;
      }, null);

      return {
        branch,
        total: branchValves.length,
        editedCount: edited.length,
        lastUpdatedAt,
      };
    })
    .sort((a, b) => {
      if (a.editedCount === 0 && b.editedCount !== 0) return -1;
      if (a.editedCount !== 0 && b.editedCount === 0) return 1;
      if (!a.lastUpdatedAt && !b.lastUpdatedAt) return 0;
      if (!a.lastUpdatedAt) return -1;
      if (!b.lastUpdatedAt) return 1;
      return new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime();
    });

  const totalDone = rows.filter((r) => r.editedCount > 0).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-[19px] font-extrabold text-foreground">ติดตามการอัปเดตข้อมูลรายสาขา</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          เช็คลิสต์ว่าสาขาไหนเข้ามาเพิ่ม/แก้ไขข้อมูลวาล์วแล้วบ้าง — {totalDone} / {rows.length} สาขา
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <CardHeader icon={ListChecks} title="สถานะรายสาขา" subtitle="เรียงสาขาที่ยังไม่อัปเดตไว้บนสุด" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  สาขา
                </th>
                <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  จำนวนวาล์ว
                </th>
                <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  แก้ไขแล้ว
                </th>
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  อัปเดตล่าสุด
                </th>
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.branch.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{r.branch.name}</td>
                  <td className="px-4 py-3 text-right text-foreground">{r.total}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {r.editedCount} / {r.total}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.lastUpdatedAt ? formatThaiDate(r.lastUpdatedAt) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        r.editedCount > 0 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                      )}
                    >
                      {r.editedCount > 0 ? "มีการอัปเดตแล้ว" : "ยังไม่อัปเดต"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
