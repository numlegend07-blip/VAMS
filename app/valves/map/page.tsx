import { getValves } from "@/lib/data/valves";
import { getBranches } from "@/lib/data/branches";
import MapView from "@/components/map/map-view";

export default async function ValveMapPage() {
  const [valves, branches] = await Promise.all([getValves(), getBranches()]);

  return <MapView valves={valves} branches={branches} />;
}
