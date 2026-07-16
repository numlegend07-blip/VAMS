"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { History, ImageIcon, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatThaiDate } from "@/lib/format";
import { PM_TYPE_STYLES, PM_TYPES } from "@/lib/pm-type";
import { STATUS_BADGE } from "@/lib/valve-status";
import CardHeader from "@/components/ui/card-header";
import SearchBox from "@/components/search/search-box";
import { cn } from "@/lib/utils";
import { Branch, PMRecordWithValve, PMType, ValveStatus } from "@/types";

const STATUSES: ValveStatus[] = ["ใช้งาน", "ไม่ได้ใช้งาน", "ไม่ระบุ"];

type Props = {
  records: PMRecordWithValve[];
  branches: Branch[];
};

export default function HistoryTable({ records: initialRecords, branches }: Props) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState<ValveStatus | "">("");
  const [type, setType] = useState<PMType | "">("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((r) => {
      if (branchId && r.valve.branch_id !== branchId) return false;
      if (status && r.status_after !== status) return false;
      if (type && r.pm_type !== type) return false;

      if (keyword) {
        const haystack = [r.valve.asset_code, r.valve.location, r.created_by_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      return true;
    });
  }, [records, search, branchId, status, type]);

  async function handleDelete(id: string) {
    if (!confirm("ยืนยันการลบบันทึกนี้?")) return;

    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("pm_history").delete().eq("id", id);

      if (error) {
        alert(`ลบไม่สำเร็จ: ${error.message}`);
        return;
      }

      setRecords((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[19px] font-extrabold text-foreground">ประวัติการบำรุงรักษา</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">บันทึกการตรวจสอบและซ่อมบำรุงทั้งหมด</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-full max-w-72">
          <SearchBox value={search} onChange={setSearch} />
        </div>

        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={filterSelectClass}>
          <option value="">ทุกสาขา</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ValveStatus | "")}
          className={filterSelectClass}
        >
          <option value="">ทุกสถานะ</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value as PMType | "")} className={filterSelectClass}>
          <option value="">ทุกประเภทงาน</option>
          {PM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} รายการ</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <CardHeader icon={History} title="รายการบันทึก" />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">ยังไม่มีรายการ</p>
            <p className="mt-1 text-xs text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  {["รหัสวาล์ว", "ชื่อจุดติดตั้ง", "สาขา", "วันที่", "ประเภทงาน", "Inlet", "Outlet", "ผู้ตรวจ", "สถานะ", "รูปภาพ", ""].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-muted">
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-xs font-medium text-foreground">
                      {r.valve.asset_code ?? r.valve_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3.5 py-2.5 text-foreground">{r.valve.location ?? "-"}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-foreground">{r.valve.branch.name}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-xs text-muted-foreground">
                      {formatThaiDate(r.performed_at)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", PM_TYPE_STYLES[r.pm_type])}>
                        {r.pm_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-display text-xs font-semibold text-foreground">
                      {r.pressure_in != null ? `${r.pressure_in} bar` : "-"}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-display text-xs font-semibold text-foreground">
                      {r.pressure_out != null ? `${r.pressure_out} bar` : "-"}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-foreground">{r.created_by_name ?? "-"}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      {r.status_after && (
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE[r.status_after])}>
                          {r.status_after}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      {r.photo_before_url || r.photo_after_url ? (
                        <div className="flex items-center gap-1.5">
                          {r.photo_before_url && (
                            <a href={r.photo_before_url} target="_blank" rel="noopener noreferrer" title="รูปก่อนทำ">
                              <ImageIcon className="h-4 w-4 text-warning" strokeWidth={2} />
                            </a>
                          )}
                          {r.photo_after_url && (
                            <a href={r.photo_after_url} target="_blank" rel="noopener noreferrer" title="รูปหลังทำ">
                              <ImageIcon className="h-4 w-4 text-success" strokeWidth={2} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        title="ลบ"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const filterSelectClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary";
