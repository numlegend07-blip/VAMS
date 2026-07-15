// สคริปต์ import ข้อมูลวาล์วจากไฟล์ Excel ต้นฉบับเข้า Supabase
// รันครั้งเดียวตอน seed ข้อมูล: node scripts/import-valves.mjs "<path ไปยังไฟล์ .xlsx>"
//
// ต้องมี SUPABASE_SERVICE_ROLE_KEY ใน .env.local (ข้าม RLS เพื่อ insert ได้)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import XLSX from "xlsx";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx), l.slice(idx + 1).trim()];
    })
);

const filePath = process.argv[2];
if (!filePath) {
  console.error("ใช้งาน: node scripts/import-valves.mjs <path ไปยังไฟล์ .xlsx>");
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// --- 1. อ่านไฟล์ Excel และแปลงเป็นแถวข้อมูลดิบ ---
const wb = XLSX.readFile(filePath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  header: 1,
  defval: "",
});

const dataRows = rows.slice(3); // ข้าม 3 แถวหัวตาราง (title + 2 แถว header)

// --- 2. เดินลูปแยกเป็นกลุ่มตามสาขา ---
const branches = []; // { name, note }
const valves = []; // { branchName, seq_no, ... }

let currentBranch = null;

function clean(v) {
  if (v === "" || v === "-" || v === undefined) return null;
  if (typeof v === "string") return v.replace(/\r?\n/g, "").trim() || null;
  return v;
}

function toNumber(v) {
  const c = clean(v);
  if (c === null) return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

for (const row of dataRows) {
  const [
    branchName,
    seqNo,
    valveType,
    brand,
    sizeMm,
    activeMark,
    inactiveMark,
    inactiveReason,
    location,
    lat,
    lng,
    installYear,
    assetCode,
    remark,
  ] = row;

  if (clean(branchName)) {
    currentBranch = clean(branchName);
    // แถวสรุปสาขาไม่มีวาล์ว เช่น "ไม่มีใช้งาน" / "ยังไม่ส่งข้อมูล"
    const isEmptyRow = !clean(valveType) && !clean(brand);
    branches.push({
      name: currentBranch,
      note: isEmptyRow ? clean(remark) : null,
    });
    if (isEmptyRow) continue;
  }

  if (!currentBranch) continue;
  if (!clean(valveType) && !clean(brand)) continue; // แถวว่าง/แถวสรุปที่ไม่มีสาขาใหม่

  let status = "ไม่ระบุ";
  if (clean(activeMark)) status = "ใช้งาน";
  else if (clean(inactiveMark)) status = "ไม่ได้ใช้งาน";

  valves.push({
    branchName: currentBranch,
    seq_no: toNumber(seqNo),
    valve_type: clean(valveType) ?? "-",
    brand: clean(brand) ?? "-",
    size_mm: toNumber(sizeMm),
    status,
    inactive_reason: clean(inactiveReason),
    location: clean(location),
    latitude: toNumber(lat),
    longitude: toNumber(lng),
    install_year_be: toNumber(installYear),
    asset_code: clean(assetCode),
    remark: clean(remark),
  });
}

console.log(`พบ ${branches.length} สาขา, ${valves.length} วาล์ว`);

// --- 3. insert branches (ใช้ upsert กันรันซ้ำ) ---
const { data: insertedBranches, error: branchError } = await supabase
  .from("branches")
  .upsert(branches, { onConflict: "name" })
  .select("id, name");

if (branchError) {
  console.error("ERROR insert branches:", branchError);
  process.exit(1);
}

const branchIdByName = new Map(insertedBranches.map((b) => [b.name, b.id]));

// --- 4. insert valves ---
const valveRows = valves.map(({ branchName, ...rest }) => ({
  ...rest,
  branch_id: branchIdByName.get(branchName),
}));

const { error: valveError, count } = await supabase
  .from("valves")
  .insert(valveRows, { count: "exact" });

if (valveError) {
  console.error("ERROR insert valves:", valveError);
  process.exit(1);
}

console.log(`นำเข้าสำเร็จ: ${insertedBranches.length} สาขา, ${count} วาล์ว`);
