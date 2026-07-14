const latestPmData = [
  {
    valve: "GL-1082",
    location: "North Pump Station",
    status: "In Progress",
    due: "2026-07-18",
    priority: "High",
  },
  {
    valve: "VL-2045",
    location: "West Distribution Hub",
    status: "Pending",
    due: "2026-07-20",
    priority: "Medium",
  },
  {
    valve: "MG-3301",
    location: "East Reservoir",
    status: "Completed",
    due: "2026-07-14",
    priority: "Low",
  },
  {
    valve: "ZH-9090",
    location: "Central Valve Yard",
    status: "Overdue",
    due: "2026-07-10",
    priority: "Critical",
  },
  {
    valve: "PV-1127",
    location: "South Maintenance Bay",
    status: "Scheduled",
    due: "2026-07-22",
    priority: "Medium",
  },
];

function statusBadge(status: string) {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-semibold";
  switch (status) {
    case "Completed":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "Overdue":
      return `${base} bg-rose-100 text-rose-700`;
    case "Pending":
      return `${base} bg-amber-100 text-amber-700`;
    case "Scheduled":
      return `${base} bg-sky-100 text-sky-700`;
    case "In Progress":
      return `${base} bg-blue-100 text-blue-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
}

function priorityBadge(priority: string) {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-semibold";
  switch (priority) {
    case "Critical":
      return `${base} bg-rose-100 text-rose-700`;
    case "High":
      return `${base} bg-orange-100 text-orange-700`;
    case "Medium":
      return `${base} bg-amber-100 text-amber-700`;
    case "Low":
      return `${base} bg-emerald-100 text-emerald-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
}

export function LatestPMTable() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Latest PM Activity</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Recent preventive maintenance work orders</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
          Updated today
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-4 py-3">Valve</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {latestPmData.map((row) => (
              <tr key={row.valve} className="rounded-3xl bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-900">{row.valve}</td>
                <td className="px-4 py-4 text-slate-600">{row.location}</td>
                <td className="px-4 py-4"> <span className={statusBadge(row.status)}>{row.status}</span> </td>
                <td className="px-4 py-4 text-slate-600">{row.due}</td>
                <td className="px-4 py-4"> <span className={priorityBadge(row.priority)}>{row.priority}</span> </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
