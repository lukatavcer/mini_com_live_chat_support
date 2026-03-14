"use client";

import { useRef, useEffect } from "react";
import { broadcast } from "./transport";

/**
 * Hook that manages typing indicator broadcasting.
 * Tracks whether the user is currently typing and only broadcasts on state changes.
 * Resets when threadId changes (e.g. switching conversations).
 */
export function useTypingBroadcast(threadId: string | null, participantId: string | null) {
  const isTypingRef = useRef(false);

  // Reset typing state when thread changes
  useEffect(() => {
    isTypingRef.current = false;
  }, [threadId]);

  const updateTyping = (hasText: boolean) => {
    if (!threadId || !participantId) return;
    if (hasText === isTypingRef.current) return;
    isTypingRef.current = hasText;
    broadcast({ type: "TYPING", threadId, participantId, isTyping: hasText });
  };

  return { updateTyping };
}
