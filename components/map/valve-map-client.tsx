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
};

export default function ValveMapClient({ valves }: Props) {
  return <ValveMap valves={valves} />;
}
