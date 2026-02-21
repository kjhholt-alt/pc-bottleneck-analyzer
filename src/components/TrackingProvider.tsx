"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/track";

/** Tracks page views on mount and route changes. */
export function TrackingProvider() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
