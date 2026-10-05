import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";
import ReportsView from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const [valves, branches] = await Promise.all([getValves(), getBranches()]);

  return <ReportsView valves={valves} branches={branches} />;
}
