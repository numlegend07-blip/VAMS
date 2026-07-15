type Props = {
  title: string;
  value: string;
};

export default function DetailSpecCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1.5 text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}
