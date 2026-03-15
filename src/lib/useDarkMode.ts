"use client";

import { useEffect } from "react";
import { useChatStore } from "./store";

/**
 * Applies the dark mode class to <html> based on store state.
 * The inline script in layout.tsx handles the initial flash prevention.
 * This hook only updates after Zustand has hydrated from localStorage.
 */
export function useDarkMode() {
  const darkMode = useChatStore((s) => s.darkMode);

  useEffect(() => {
    if (useChatStore.persist.hasHydrated()) {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode]);
}
