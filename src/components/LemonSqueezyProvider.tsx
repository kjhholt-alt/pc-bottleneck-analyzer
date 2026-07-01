"use client";

import { useEffect } from "react";
import Script from "next/script";
import { setProUser } from "@/lib/pro";
import { trackPurchase } from "@/lib/track";

const JUST_UNLOCKED_KEY = "pc-pro-just-unlocked";

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
        trackPurchase("overlay");
        try {
          sessionStorage.setItem(JUST_UNLOCKED_KEY, "1");
        } catch {
          // Non-fatal — the unlock itself already persisted
        }
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

/** Read-and-clear the "just unlocked" flag set right before the post-purchase reload. */
export function consumeJustUnlocked(): boolean {
  try {
    if (sessionStorage.getItem(JUST_UNLOCKED_KEY) === "1") {
      sessionStorage.removeItem(JUST_UNLOCKED_KEY);
      return true;
    }
  } catch {
    // storage unavailable
  }
  return false;
}
