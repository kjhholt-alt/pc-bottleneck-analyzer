"use client";

import { useEffect } from "react";
import Script from "next/script";
import { setProUser } from "@/lib/pro";

/**
 * Loads the Lemon Squeezy checkout overlay script and listens for
 * successful purchases. On checkout success, grants Pro access via
 * localStorage and refreshes the page so gates update.
 */
export function LemonSqueezyProvider() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Lemon Squeezy fires postMessage events from its overlay iframe.
      // The "Checkout.Success" event means the user completed payment.
      if (
        typeof event.data === "object" &&
        event.data?.event === "Checkout.Success"
      ) {
        setProUser(true);
        // Small delay so the overlay close animation finishes
        setTimeout(() => window.location.reload(), 1500);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="lazyOnload"
    />
  );
}
