interface NavbarProps {
  onToggle: () => void;
}

export function Navbar({ onToggle }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-950/10">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500 hover:text-white lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/20">
              <span className="text-lg font-bold">V</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">VAMS</p>
              <p className="text-xs text-slate-400">Valve Alert & Maintenance System</p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">Azure Enterprise</div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">ArcGIS style</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800">Notifications</button>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10">Admin</div>
        </div>
      </div>
    </header>
  );
}
