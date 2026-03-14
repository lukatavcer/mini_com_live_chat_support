"use client";

import { useRef, useEffect, useCallback } from "react";
import { broadcast } from "./transport";

/**
 * Hook that manages typing indicator broadcasting.
 * Tracks whether the user is currently typing and only broadcasts on state changes.
 * Broadcasts isTyping:false on unmount or thread change to prevent stuck indicators.
 */
export function useTypingBroadcast(threadId: string | null, participantId: string | null) {
  const isTypingRef = useRef(false);
  const threadIdRef = useRef(threadId);
  const participantIdRef = useRef(participantId);

  // Keep refs in sync
  threadIdRef.current = threadId;
  participantIdRef.current = participantId;

  // Clear typing indicator on thread change or unmount
  useEffect(() => {
    return () => {
      if (isTypingRef.current && threadIdRef.current && participantIdRef.current) {
        broadcast({
          type: "TYPING",
          threadId: threadIdRef.current,
          participantId: participantIdRef.current,
          isTyping: false,
        });
        isTypingRef.current = false;
      }
    };
  }, [threadId]);

  const updateTyping = useCallback((hasText: boolean) => {
    if (!threadIdRef.current || !participantIdRef.current) return;
    if (hasText === isTypingRef.current) return;
    isTypingRef.current = hasText;
    broadcast({
      type: "TYPING",
      threadId: threadIdRef.current,
      participantId: participantIdRef.current,
      isTyping: hasText,
    });
  }, []);

  return { updateTyping };
}
