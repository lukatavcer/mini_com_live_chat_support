"use client";

import { useEffect } from "react";
import { useChatStore } from "./store";

/**
 * Applies the dark mode class to <html> based on store state.
 *
 * Waits for Zustand's persist middleware to rehydrate before toggling,
 * so we don't accidentally remove the class that the inline <script>
 * in layout.tsx added during initial page load.
 */
export function useDarkMode() {
  const darkMode = useChatStore((s) => s.darkMode);

  useEffect(() => {
    // Only apply after the persisted store has rehydrated from localStorage.
    // Before rehydration, darkMode is the default (false), which would
    // incorrectly remove the "dark" class set by the inline script.
    const unsub = useChatStore.persist.onFinishHydration(() => {
      document.documentElement.classList.toggle("dark", useChatStore.getState().darkMode);
    });

    // If already hydrated (e.g. on client-side navigation), apply immediately
    if (useChatStore.persist.hasHydrated()) {
      document.documentElement.classList.toggle("dark", darkMode);
    }

    return unsub;
  }, [darkMode]);
}
