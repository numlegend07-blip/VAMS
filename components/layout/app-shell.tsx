"use client";

import { useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileNavOpen((v) => !v)} />
        <main className="flex-1 bg-background px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
