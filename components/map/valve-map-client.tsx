"use client";

import dynamic from "next/dynamic";

import { ValveWithBranch } from "@/types";

const ValveMap = dynamic(() => import("./valve-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      กำลังโหลดแผนที่...
    </div>
  ),
});

type Props = {
  valves: ValveWithBranch[];
  editable?: boolean;
};

export default function ValveMapClient({ valves, editable }: Props) {
  return <ValveMap valves={valves} editable={editable} />;
}
