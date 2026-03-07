/**
 * Hook that subscribes to BroadcastChannel events and syncs
 * incoming data into the Zustand store. Used by both visitor and agent apps.
 */

"use client";

import { useEffect } from "react";
import { subscribe } from "./transport";
import { useChatStore } from "./store";

export function useTransportSync() {
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const receiveThread = useChatStore((s) => s.receiveThread);
  const setTyping = useChatStore((s) => s.setTyping);
  const setPresence = useChatStore((s) => s.setPresence);
  const markAsRead = useChatStore((s) => s.markAsRead);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      switch (event.type) {
        case "NEW_MESSAGE":
          receiveMessage(event.message);
          break;
        case "NEW_THREAD":
          receiveThread(event.thread);
          break;
        case "TYPING":
          // Don't broadcast again — just update local state directly
          useChatStore.setState((state) => ({
            threads: state.threads.map((t) =>
              t.id === event.threadId
                ? {
                    ...t,
                    participants: t.participants.map((p) =>
                      p.id === event.participantId ? { ...p, isTyping: event.isTyping } : p
                    ),
                  }
                : t
            ),
          }));
          break;
        case "PRESENCE":
          useChatStore.setState((state) => ({
            threads: state.threads.map((t) => ({
              ...t,
              participants: t.participants.map((p) =>
                p.id === event.participantId ? { ...p, isOnline: event.isOnline } : p
              ),
            })),
          }));
          break;
        case "READ_RECEIPT":
          useChatStore.setState((state) => ({
            threads: state.threads.map((t) =>
              t.id === event.threadId
                ? {
                    ...t,
                    readReceipts: t.readReceipts.map((r) =>
                      r.participantId === event.participantId
                        ? { ...r, lastReadTimestamp: event.timestamp }
                        : r
                    ),
                  }
                : t
            ),
          }));
          break;
      }
    });

    return unsubscribe;
  }, [receiveMessage, receiveThread, setTyping, setPresence, markAsRead]);
}
