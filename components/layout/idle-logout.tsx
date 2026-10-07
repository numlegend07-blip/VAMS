"use client";

import { useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 นาที ไม่มีการใช้งาน
const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const STORAGE_KEY = "vams:last-activity";
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

function markActivity() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // private browsing / storage blocked — idle check just falls back to Date.now()
  }
}

// Tracked globally in localStorage (not per-tab state) so activity in any open
// VAMS tab resets the idle clock for all of them, and a tab left open alone
// still gets signed out once the whole browser has been idle too long.
export default function IdleLogout() {
  const lastWriteRef = useRef(0);

  useEffect(() => {
    markActivity();

    function handleActivity() {
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_THROTTLE_MS) return;
      lastWriteRef.current = now;
      markActivity();
    }

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    const interval = setInterval(async () => {
      let last = Date.now();
      try {
        last = Number(localStorage.getItem(STORAGE_KEY)) || Date.now();
      } catch {
        // ignore
      }

      if (Date.now() - last >= IDLE_LIMIT_MS) {
        clearInterval(interval);
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login?reason=idle";
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, []);

  return null;
}
