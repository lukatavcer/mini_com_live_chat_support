/** Generate a unique ID using crypto API with timestamp prefix for sortability */
export function generateId(): string {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Format a timestamp into a human-readable time string (e.g., "2:30 PM") */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Truncate text to a max length, appending ellipsis if needed */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Create a debounced version of a function with a cancel method.
 * Call `.cancel()` to clear any pending invocation (e.g. on unmount).
 */
export type DebouncedFn<T extends (...args: never[]) => void> = T & { cancel: () => void };

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as DebouncedFn<T>;
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
