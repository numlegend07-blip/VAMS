import { Building2, CalendarDays, UserRound } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-6 py-8 shadow-lg md:px-9 md:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/10"
      />

      <div className="relative">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Valve Management
        </h1>
        <p className="mt-1.5 text-sm text-blue-100 md:text-base">
          ระบบจัดการ Control Valve การประปาส่วนภูมิภาค เขต 10
        </p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-50">
          <span className="flex items-center gap-2">
            <UserRound className="h-4 w-4" strokeWidth={2.25} />
            นายปภินวิชย์ แตงหอม
          </span>
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" strokeWidth={2.25} />
            การประปาส่วนภูมิภาคสาขาพิจิตร
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
            15 กรกฎาคม 2569
          </span>
        </div>
      </div>
    </div>
  );
}
