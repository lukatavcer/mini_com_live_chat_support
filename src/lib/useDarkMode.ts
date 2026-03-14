"use client";

import { useEffect } from "react";
import { useChatStore } from "./store";

/**
 * Applies the dark mode class to <html> based on store state.
 *
 * Registers hydration listener once on mount, then reacts to darkMode changes.
 * The inline <script> in layout.tsx handles the initial flash prevention.
 */
export function useDarkMode() {
  const darkMode = useChatStore((s) => s.darkMode);

  // Register hydration listener once on mount
  useEffect(() => {
    const unsub = useChatStore.persist.onFinishHydration(() => {
      document.documentElement.classList.toggle("dark", useChatStore.getState().darkMode);
    });
    return unsub;
  }, []);

  // React to darkMode changes after hydration
  useEffect(() => {
    if (useChatStore.persist.hasHydrated()) {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode]);
}
