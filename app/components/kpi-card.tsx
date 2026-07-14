interface KpiCardProps {
  label: string;
  value: string;
  accent: string;
  description?: string;
}

export function KpiCard({ label, value, accent, description }: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-5 text-4xl font-semibold ${accent}`}>{value}</p>
      {description ? (
        <p className="mt-3 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
