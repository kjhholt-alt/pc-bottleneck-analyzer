"use client";

import { useEffect } from "react";
import Script from "next/script";
import { setProUser } from "@/lib/pro";
import { trackPurchase } from "@/lib/track";

const JUST_UNLOCKED_KEY = "pc-pro-just-unlocked";

interface LemonSqueezyGlobal {
  createLemonSqueezy?: () => void;
  LemonSqueezy?: {
    Setup?: (opts: {
      eventHandler: (event: { event?: string }) => void;
    }) => void;
  };
}

let unlocked = false;

function grantPro(source: string) {
  if (unlocked) return; // Setup handler + postMessage fallback can both fire
  unlocked = true;

  setProUser(true);
  trackPurchase(source);
  try {
    sessionStorage.setItem(JUST_UNLOCKED_KEY, "1");
  } catch {
    // Non-fatal — the unlock itself already persisted
  }
  // Small delay so the overlay close animation finishes
  setTimeout(() => window.location.reload(), 1500);
}

/**
 * Loads the Lemon Squeezy checkout overlay script, initializes it
 * (lemon.js does nothing until createLemonSqueezy() is called), and
 * listens for successful purchases. On checkout success, grants Pro
 * access via localStorage and refreshes the page so gates update.
 */
export function LemonSqueezyProvider() {
  useEffect(() => {
    // Fallback: older lemon.js builds emit postMessage from the overlay
    // iframe instead of (or in addition to) the Setup event handler.
    function handleMessage(event: MessageEvent) {
      if (
        typeof event.data === "object" &&
        event.data?.event === "Checkout.Success"
      ) {
        grantPro("overlay-message");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="lazyOnload"
      onLoad={() => {
        const w = window as unknown as LemonSqueezyGlobal;
        w.createLemonSqueezy?.();
        w.LemonSqueezy?.Setup?.({
          eventHandler: (event) => {
            if (event?.event === "Checkout.Success") {
              grantPro("overlay");
            }
          },
        });
      }}
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
