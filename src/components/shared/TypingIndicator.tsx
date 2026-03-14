"use client";

/** Animated typing indicator (three bouncing dots) with ARIA live region */
export function TypingIndicator({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
      role="status"
      aria-live="polite"
      aria-label={`${name} is typing`}
    >
      <div className="flex gap-1" aria-hidden="true">
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span>{name} is typing...</span>
    </div>
  );
}
