"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, Loader2, Printer } from "lucide-react";

import { Branch, ValveWithBranch } from "@/types";
import { EffectiveStatus, getEffectiveStatus } from "@/lib/valve-effective-status";

type Props = {
  valves: ValveWithBranch[];
  branches: Branch[];
};

type BranchSummary = {
  branch: Branch;
  total: number;
  ใช้งาน: number;
  ไม่ได้ใช้งาน: number;
  ชำรุด: number;
};

const STATUS_COLUMNS: { key: EffectiveStatus; label: string }[] = [
  { key: "ใช้งาน", label: "ใช้งานปกติ" },
  { key: "ไม่ได้ใช้งาน", label: "ไม่ได้ใช้งาน" },
  { key: "ชำรุด", label: "ชำรุด" },
];

const today = () =>
  new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export default function ReportsView({ valves, branches }: Props) {
  const [exporting, setExporting] = useState(false);
  const generatedAt = useMemo(() => today(), []);

  const summaries: BranchSummary[] = useMemo(() => {
    return branches
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((branch) => {
        const branchValves = valves.filter((v) => v.branch_id === branch.id);
        return {
          branch,
          total: branchValves.length,
          ใช้งาน: branchValves.filter((v) => getEffectiveStatus(v) === "ใช้งาน").length,
          ไม่ได้ใช้งาน: branchValves.filter((v) => getEffectiveStatus(v) === "ไม่ได้ใช้งาน").length,
          ชำรุด: branchValves.filter((v) => getEffectiveStatus(v) === "ชำรุด").length,
        };
      });
  }, [valves, branches]);

  const grandTotal = useMemo(
    () => ({
      total: valves.length,
      ใช้งาน: valves.filter((v) => getEffectiveStatus(v) === "ใช้งาน").length,
      ไม่ได้ใช้งาน: valves.filter((v) => getEffectiveStatus(v) === "ไม่ได้ใช้งาน").length,
      ชำรุด: valves.filter((v) => getEffectiveStatus(v) === "ชำรุด").length,
    }),
    [valves]
  );

  async function handleExportExcel() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const header = ["ลำดับ", "สาขา", "จำนวนวาล์วทั้งหมด", "ใช้งานปกติ", "%", "ไม่ได้ใช้งาน", "%", "ชำรุด", "%"];

      const rows = summaries.map((s, i) => [
        i + 1,
        s.branch.name,
        s.total,
        s.ใช้งาน,
        pct(s.ใช้งาน, s.total),
        s.ไม่ได้ใช้งาน,
        pct(s.ไม่ได้ใช้งาน, s.total),
        s.ชำรุด,
        pct(s.ชำรุด, s.total),
      ]);

      const totalRow = [
        "",
        "รวมทั้งหมด",
        grandTotal.total,
        grandTotal.ใช้งาน,
        pct(grandTotal.ใช้งาน, grandTotal.total),
        grandTotal.ไม่ได้ใช้งาน,
        pct(grandTotal.ไม่ได้ใช้งาน, grandTotal.total),
        grandTotal.ชำรุด,
        pct(grandTotal.ชำรุด, grandTotal.total),
      ];

      const ws = XLSX.utils.aoa_to_sheet([
        [`รายงานสรุปสถานะวาล์วรายสาขา — การประปาส่วนภูมิภาค เขต 10`],
        [`ข้อมูล ณ วันที่ ${generatedAt}`],
        [],
        header,
        ...rows,
        totalRow,
      ]);

      ws["!cols"] = [
        { wch: 6 },
        { wch: 24 },
        { wch: 16 },
        { wch: 12 },
        { wch: 6 },
        { wch: 12 },
        { wch: 6 },
        { wch: 10 },
        { wch: 6 },
      ];
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "สรุปรายสาขา");
      XLSX.writeFile(wb, `รายงานสถานะวาล์วรายสาขา_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4.5 shadow-sm print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            <BarChart3 className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-[15px] font-extrabold text-foreground">รายงานสรุปสถานะวาล์วรายสาขา</h1>
            <p className="text-[11px] text-muted-foreground">เขต 10 · ข้อมูล ณ วันที่ {generatedAt}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" strokeWidth={2.25} />
            )}
            ส่งออก Excel
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Printer className="h-4 w-4" strokeWidth={2.25} />
            พิมพ์ / บันทึกเป็น PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="mb-5 hidden text-center print:block">
          <h1 className="text-lg font-extrabold text-foreground">รายงานสรุปสถานะวาล์วรายสาขา</h1>
          <p className="text-sm text-muted-foreground">การประปาส่วนภูมิภาค เขต 10</p>
          <p className="mt-1 text-xs text-muted-foreground">ข้อมูล ณ วันที่ {generatedAt}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted print:bg-transparent">
                <th className="px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  ลำดับ
                </th>
                <th className="px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  สาขา
                </th>
                <th className="px-3 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  ทั้งหมด
                </th>
                {STATUS_COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="px-3 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((s, i) => (
                <tr key={s.branch.id}>
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-foreground">{s.branch.name}</td>
                  <td className="px-3 py-2 text-right font-semibold text-foreground">{s.total}</td>
                  {STATUS_COLUMNS.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-right text-foreground">
                      {s[c.key]}{" "}
                      <span className="text-[10.5px] text-muted-foreground">({pct(s[c.key], s.total)}%)</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-extrabold text-foreground">
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5">รวมทั้งหมด</td>
                <td className="px-3 py-2.5 text-right">{grandTotal.total}</td>
                {STATUS_COLUMNS.map((c) => (
                  <td key={c.key} className="px-3 py-2.5 text-right">
                    {grandTotal[c.key]}{" "}
                    <span className="text-[10.5px] font-medium text-muted-foreground">
                      ({pct(grandTotal[c.key], grandTotal.total)}%)
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
