import type { StateStorage } from "zustand/middleware";

/** Whether localStorage is available in this environment */
let storageAvailable: boolean | null = null;
let warned = false;

function isLocalStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const testKey = "__minicom_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function warnOnce(): void {
  if (warned) return;
  warned = true;
  console.warn("[MiniCom] localStorage unavailable — chat data will not persist across sessions.");
}

/** In-memory fallback when localStorage is disabled */
const memoryStore = new Map<string, string>();

/** Storage adapter that falls back to in-memory when localStorage is unavailable */
export const safeStorage: StateStorage = {
  getItem(name: string): string | null {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(name);
    }
    warnOnce();
    return memoryStore.get(name) ?? null;
  },
  setItem(name: string, value: string): void {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(name, value);
      } catch {
        // quota exceeded — silently fall back to memory
        memoryStore.set(name, value);
      }
      return;
    }
    warnOnce();
    memoryStore.set(name, value);
  },
  removeItem(name: string): void {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(name);
      return;
    }
    memoryStore.delete(name);
  },
};
