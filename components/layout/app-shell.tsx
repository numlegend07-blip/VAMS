"use client";

import { useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";
import IdleLogout from "./idle-logout";
import { Profile } from "@/types";
import { DueValve } from "@/lib/data/pm-history";

type Props = {
  children: React.ReactNode;
  profile: Profile | null;
  dueValves: DueValve[];
};

export default function AppShell({ children, profile, dueValves }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <IdleLogout />
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileNavOpen((v) => !v)} profile={profile} dueValves={dueValves} />
        <main className="flex-1 bg-background px-5 py-6 print:p-0 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
