import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";
import MapView from "@/components/map/map-view";

type Props = {
  searchParams: Promise<{ valve?: string }>;
};

export default async function ValveMapPage({ searchParams }: Props) {
  const { valve } = await searchParams;
  const [valves, branches] = await Promise.all([getValves(), getBranches()]);

  return <MapView valves={valves} branches={branches} focusValveId={valve ?? null} />;
}
