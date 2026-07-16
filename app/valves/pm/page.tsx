import { getValves } from "@/lib/data/valves";
import { getAllPMHistory, getPMStats } from "@/lib/data/pm-history";
import { getCurrentProfile } from "@/lib/data/profile";
import PMRecordForm from "@/components/pm/pm-record-form";

export default async function PMRecordPage() {
  const [valves, stats, profile, latest] = await Promise.all([
    getValves(),
    getPMStats(),
    getCurrentProfile(),
    getAllPMHistory(1),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <PMRecordForm valves={valves} stats={stats} profile={profile} latest={latest[0] ?? null} />
    </div>
  );
}
