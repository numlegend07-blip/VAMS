import { getValveById } from "@/lib/data/valves";
import ValveInfoCard from "@/components/detail/valve-info-card";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ValveDetailPage({ params }: Props) {
  const { id } = await params;

  const valve = await getValveById(id);

  if (!valve) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          ไม่พบข้อมูลวาล์ว
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          รหัส &ldquo;{id}&rdquo; ไม่มีอยู่ในระบบ
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <ValveInfoCard valve={valve} />
    </div>
  );
}
