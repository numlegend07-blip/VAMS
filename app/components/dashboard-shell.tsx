"use client";

import { useState } from "react";
import { KpiCard } from "./kpi-card";
import { LatestPMTable } from "./latest-pm-table";
import { Navbar } from "./navbar";
import { PlaceholderCard } from "./placeholder-card";
import { Sidebar } from "./sidebar";

const cards = [
  {
    label: "Total Valves",
    value: "2,847",
    accent: "text-slate-900",
    description: "All active valves monitored across the network.",
  },
  {
    label: "PM Due",
    value: "34",
    accent: "text-sky-700",
    description: "Planned maintenance checks due this week.",
  },
  {
    label: "Overdue",
    value: "7",
    accent: "text-rose-600",
    description: "Valves pending service beyond target date.",
  },
  {
    label: "Completed %",
    value: "94%",
    accent: "text-emerald-600",
    description: "Preventive maintenance completion rate.",
  },
];

export function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onToggle={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative mx-auto flex min-h-screen max-w-[1720px] gap-6 px-4 pt-24 pb-10 lg:px-6 lg:pl-80">
        <section className="w-full space-y-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-200/60">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Executive dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">Valve Alert & Maintenance System</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Real-time operational insights with modern GIS and preventive maintenance visibility for enterprise asset teams.
                </p>
              </div>
              <div className="hidden rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 sm:flex">
                Azure / ArcGIS enterprise theme
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <KpiCard key={card.label} label={card.label} value={card.value} accent={card.accent} description={card.description} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PlaceholderCard
              title="PM Compliance"
              caption="Operational performance trends and compliance scores for preventive maintenance across the system."
            />
            <PlaceholderCard
              title="Valve Status"
              caption="Live status distribution for valves by condition, pressure state and active service window."
            />
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">GIS Map</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Network valve geography</h2>
                </div>
                <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  Live spatial placeholder
                </div>
              </div>
              <div className="flex h-[520px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400">
                <div>
                  <p className="text-5xl">🗺️</p>
                  <p className="mt-4 max-w-xl text-base leading-7">
                    GIS map placeholder for the valve network and asset locations. Replace this panel with a live ArcGIS / map component when backend integration is ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <LatestPMTable />
        </section>
      </main>
    </div>
  );
}
