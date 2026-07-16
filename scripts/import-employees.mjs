// สคริปต์ import รายชื่อพนักงานจากไฟล์ Excel เข้า Supabase Auth + profiles
// รันครั้งเดียวตอน seed ข้อมูล: node scripts/import-employees.mjs "<path ไปยังไฟล์ .xlsx>"
//
// ต้องมี SUPABASE_SERVICE_ROLE_KEY ใน .env.local (สร้างบัญชี auth.users ได้ต้องใช้สิทธิ์นี้)
// ปลอดภัยที่จะรันซ้ำ: ข้ามแถวที่มี employee_code อยู่ในระบบแล้ว

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
  console.error("ใช้งาน: node scripts/import-employees.mjs <path ไปยังไฟล์ .xlsx>");
  process.exit(1);
}

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ไม่พบ SUPABASE_SERVICE_ROLE_KEY ใน .env.local");
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BRANCH_PREFIX = "กปภ.สาขา";

function clean(v) {
  if (v === "" || v === undefined || v === null) return null;
  const s = String(v).trim();
  return s || null;
}

// --- 1. อ่านไฟล์ Excel ---
const wb = XLSX.readFile(filePath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: "" });
const header = rows[0];
const idx = (name) => header.indexOf(name);

const col = {
  code: idx("รหัสพนักงาน"),
  name: idx("ชื่อ-สกุล"),
  position: idx("ตำแหน่ง"),
  unit: idx("สาขา/หน่วยงาน"),
  department: idx("ฝ่าย/งาน"),
  password: idx("รหัสผ่าน"),
  status: idx("สถานะ"),
};

const employees = rows
  .slice(1)
  .filter((r) => r.some((c) => String(c).trim() !== ""))
  .map((r) => ({
    code: clean(r[col.code]),
    fullName: clean(r[col.name]),
    position: clean(r[col.position]),
    unit: clean(r[col.unit]),
    department: clean(r[col.department]),
    password: clean(r[col.password]),
    status: clean(r[col.status]),
  }))
  .filter((e) => e.status === "active");

console.log(`อ่านไฟล์ได้ ${employees.length} คน (สถานะ active)`);

// --- 2. โหลดสาขาทั้งหมดเพื่อจับคู่ชื่อ ---
const { data: branches, error: branchError } = await supabase.from("branches").select("id, name");
if (branchError) {
  console.error("โหลดสาขาไม่สำเร็จ:", branchError.message);
  process.exit(1);
}
const branchIdByName = new Map(branches.map((b) => [b.name, b.id]));

function resolveBranch(unit) {
  if (!unit || !unit.startsWith(BRANCH_PREFIX)) return null;
  const name = unit.slice(BRANCH_PREFIX.length);
  return branchIdByName.get(name) ?? null;
}

// --- 3. โหลด employee_code ที่มีอยู่แล้ว เพื่อข้ามตอนรันซ้ำ ---
const { data: existing, error: existingError } = await supabase
  .from("profiles")
  .select("employee_code")
  .not("employee_code", "is", null);
if (existingError) {
  console.error("โหลดรายชื่อเดิมไม่สำเร็จ:", existingError.message);
  process.exit(1);
}
const existingCodes = new Set(existing.map((p) => p.employee_code));

// --- 4. สร้างบัญชีทีละคน ---
let created = 0;
let skipped = 0;
const failed = [];

for (const emp of employees) {
  if (existingCodes.has(emp.code)) {
    skipped++;
    continue;
  }

  const branchId = resolveBranch(emp.unit);
  const role = branchId ? "branch_staff" : "region_admin";
  const email = `${emp.code}@vams.local`;

  const { data: created_user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: emp.password ?? emp.code,
    email_confirm: true,
    user_metadata: { full_name: emp.fullName },
  });

  if (createError) {
    failed.push({ code: emp.code, reason: createError.message });
    continue;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      employee_code: emp.code,
      position: emp.position,
      department: emp.department,
      branch_id: branchId,
      role,
    })
    .eq("id", created_user.user.id);

  if (updateError) {
    failed.push({ code: emp.code, reason: `profile update: ${updateError.message}` });
    continue;
  }

  created++;
}

console.log(`สร้างสำเร็จ: ${created} คน, ข้าม (มีอยู่แล้ว): ${skipped} คน, ล้มเหลว: ${failed.length} คน`);
if (failed.length > 0) {
  console.log("รายการที่ล้มเหลว:");
  failed.forEach((f) => console.log(`  ${f.code}: ${f.reason}`));
}
