interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { title: "Dashboard", icon: "📊", href: "#" },
  { title: "GIS Map", icon: "🗺️", href: "#" },
  { title: "Valve Management", icon: "⚙️", href: "#" },
  { title: "PM Management", icon: "🛠️", href: "#" },
  { title: "Reports", icon: "📁", href: "#" },
  { title: "Settings", icon: "⚙️", href: "#" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/30 transition duration-300 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">Navigation</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Enterprise Menu</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-500 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${index === 0 ? "bg-slate-800 text-white shadow-inner" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.title}</span>
            </a>
          ))}
        </nav>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-slate-300">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">System health</p>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-3 py-3">
              <span>Operational</span>
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Normal</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-3 py-3">
              <span>GIS Sync</span>
              <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950">Live</span>
            </div>
          </div>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      ) : null}
    </>
  );
}
