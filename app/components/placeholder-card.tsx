interface PlaceholderCardProps {
  title: string;
  caption: string;
  fullHeight?: boolean;
}

export function PlaceholderCard({ title, caption, fullHeight }: PlaceholderCardProps) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${fullHeight ? "h-full" : "h-96"}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            {title}
          </div>
          <div className="mt-10 flex h-[calc(100%-4rem)] flex-col items-center justify-center gap-4 text-center text-slate-400">
            <div className="rounded-3xl bg-slate-100 p-8 text-5xl">📊</div>
            <div className="max-w-sm text-sm leading-6 text-slate-500">{caption}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
