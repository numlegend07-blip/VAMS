import { getAllPMHistory } from "@/lib/data/pm-history";
import { getBranches } from "@/lib/data/branches";
import HistoryTable from "@/components/pm/history-table";

export default async function PMHistoryPage() {
  const [records, branches] = await Promise.all([getAllPMHistory(), getBranches()]);

  return (
    <div className="mx-auto max-w-7xl">
      <HistoryTable records={records} branches={branches} />
    </div>
  );
}
