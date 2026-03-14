/**
 * Hook that subscribes to BroadcastChannel events and syncs
 * incoming data into the Zustand store. Used by both visitor and agent apps.
 *
 * Typing indicators auto-clear after TYPING_TIMEOUT_MS if no new
 * typing event is received (handles sender tab closing mid-type).
 */

"use client";

import { useEffect, useRef } from "react";
import { subscribe } from "./transport";
import { useChatStore } from "./store";

const TYPING_TIMEOUT_MS = 3000;

export function useTransportSync() {
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const receiveThread = useChatStore((s) => s.receiveThread);
  const applyRemoteTyping = useChatStore((s) => s.applyRemoteTyping);
  const applyRemotePresence = useChatStore((s) => s.applyRemotePresence);
  const applyRemoteReadReceipt = useChatStore((s) => s.applyRemoteReadReceipt);
  const applyRemoteMessageStatus = useChatStore((s) => s.applyRemoteMessageStatus);

  // Map of "threadId:participantId" → timeout handle for typing auto-clear
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      switch (event.type) {
        case "NEW_MESSAGE":
          receiveMessage(event.message);
          break;
        case "NEW_THREAD":
          receiveThread(event.thread);
          break;
        case "MESSAGE_STATUS":
          applyRemoteMessageStatus(event.threadId, event.messageId, event.status);
          break;
        case "TYPING": {
          applyRemoteTyping(event.threadId, event.participantId, event.isTyping);

          const key = `${event.threadId}:${event.participantId}`;
          const existing = typingTimers.current.get(key);
          if (existing) clearTimeout(existing);

          if (event.isTyping) {
            typingTimers.current.set(key, setTimeout(() => {
              applyRemoteTyping(event.threadId, event.participantId, false);
              typingTimers.current.delete(key);
            }, TYPING_TIMEOUT_MS));
          } else {
            typingTimers.current.delete(key);
          }
          break;
        }
        case "PRESENCE":
          applyRemotePresence(event.participantId, event.isOnline);
          break;
        case "READ_RECEIPT":
          applyRemoteReadReceipt(event.threadId, event.participantId, event.timestamp);
          break;
      }
    });

    return () => {
      unsubscribe();
      typingTimers.current.forEach((timer) => clearTimeout(timer));
      typingTimers.current.clear();
    };
  }, [receiveMessage, receiveThread, applyRemoteTyping, applyRemotePresence, applyRemoteReadReceipt, applyRemoteMessageStatus]);
}
