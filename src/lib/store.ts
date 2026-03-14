/**
 * Zustand store for MiniCom chat state management.
 *
 * Handles all chat state including threads, messages, typing indicators,
 * presence, and read receipts. Persists to localStorage for durability.
 *
 * Key design decisions:
 * - Single store shared by both visitor and agent apps
 * - Optimistic message sending with retry on failure
 * - Sequence numbers for out-of-order message handling
 * - localStorage persistence via Zustand middleware
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Thread, Message, MessageStatus, ID, ParticipantRole } from "./types";
import { broadcast } from "./transport";
import { generateId } from "./utils";
import { CURRENT_AGENT_ID, CURRENT_AGENT_NAME } from "./constants";
import { safeStorage } from "./safeStorage";

/** Global sequence counter — increments per message to maintain ordering */
let sequenceCounter = 0;

interface ChatState {
  threads: Thread[];
  /** ID of the currently active/selected thread */
  activeThreadId: ID | null;
  /** Dark mode preference */
  darkMode: boolean;

  // --- Thread actions ---
  createThread: (visitorName: string) => Thread;
  getThread: (threadId: ID) => Thread | undefined;

  // --- Message actions ---
  sendMessage: (threadId: ID, content: string, senderRole: ParticipantRole) => Message;
  updateMessageStatus: (threadId: ID, messageId: ID, status: MessageStatus) => void;
  receiveMessage: (message: Message) => void;
  retryMessage: (threadId: ID, messageId: ID) => void;

  // --- UI actions ---
  setActiveThread: (threadId: ID | null) => void;
  toggleDarkMode: () => void;

  // --- Typing & Presence ---
  setTyping: (threadId: ID, participantId: ID, isTyping: boolean) => void;
  setPresence: (participantId: ID, isOnline: boolean) => void;

  // --- Read receipts ---
  markAsRead: (threadId: ID, participantId: ID) => void;
  getUnreadCount: (threadId: ID, participantId: ID) => number;

  // --- Incoming thread sync ---
  receiveThread: (thread: Thread) => void;

  // --- Remote event actions (used by useTransportSync, no re-broadcast) ---
  applyRemoteTyping: (threadId: ID, participantId: ID, isTyping: boolean) => void;
  applyRemotePresence: (participantId: ID, isOnline: boolean) => void;
  applyRemoteReadReceipt: (threadId: ID, participantId: ID, timestamp: number) => void;
  applyRemoteMessageStatus: (threadId: ID, messageId: ID, status: MessageStatus) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      darkMode: false,

      createThread: (visitorName: string) => {
        const visitorId = generateId();
        const thread: Thread = {
          id: generateId(),
          visitorId,
          visitorName,
          messages: [],
          participants: [
            { id: visitorId, role: "visitor", name: visitorName, isOnline: true, isTyping: false },
            { id: CURRENT_AGENT_ID, role: "agent", name: CURRENT_AGENT_NAME, isOnline: true, isTyping: false },
          ],
          readReceipts: [
            { participantId: visitorId, lastReadTimestamp: Date.now() },
            { participantId: CURRENT_AGENT_ID, lastReadTimestamp: 0 },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({ threads: [...state.threads, thread] }));
        broadcast({ type: "NEW_THREAD", thread });
        return thread;
      },

      getThread: (threadId: ID) => {
        return get().threads.find((t) => t.id === threadId);
      },

      sendMessage: (threadId: ID, content: string, senderRole: ParticipantRole) => {
        const thread = get().getThread(threadId);
        if (!thread) throw new Error(`Thread ${threadId} not found`);

        const sender = thread.participants.find((p) => p.role === senderRole);
        if (!sender) throw new Error(`No ${senderRole} participant in thread`);

        sequenceCounter++;
        const message: Message = {
          id: generateId(),
          threadId,
          senderId: sender.id,
          senderRole,
          content,
          timestamp: Date.now(),
          status: "sending", // optimistic — will be updated to "sent"
          sequence: sequenceCounter,
        };

        // Optimistic update: add message immediately with "sending" status
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, message], updatedAt: Date.now() }
              : t
          ),
        }));

        // Simulate network delay, then mark as "sent" and broadcast
        simulateSend(message, get, set);

        return message;
      },

      updateMessageStatus: (threadId: ID, messageId: ID, status: MessageStatus) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, status } : m
                  ),
                }
              : t
          ),
        }));
        broadcast({ type: "MESSAGE_STATUS", messageId, threadId, status });
      },

      receiveMessage: (message: Message) => {
        set((state) => {
          const thread = state.threads.find((t) => t.id === message.threadId);
          if (!thread) return state;

          // Prevent duplicate messages
          if (thread.messages.some((m) => m.id === message.id)) return state;

          // Insert in correct position based on sequence number (handles out-of-order)
          const updatedMessages = [...thread.messages, { ...message, status: "sent" as const }]
            .sort((a, b) => a.sequence - b.sequence);

          return {
            threads: state.threads.map((t) =>
              t.id === message.threadId
                ? { ...t, messages: updatedMessages, updatedAt: Date.now() }
                : t
            ),
          };
        });
      },

      retryMessage: (threadId: ID, messageId: ID) => {
        const thread = get().getThread(threadId);
        if (!thread) return;
        const message = thread.messages.find((m) => m.id === messageId);
        if (!message || message.status !== "failed") return;

        // Reset to "sending" and retry
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, status: "sending" as const } : m
                  ),
                }
              : t
          ),
        }));

        simulateSend({ ...message, status: "sending" }, get, set);
      },

      setActiveThread: (threadId: ID | null) => {
        set({ activeThreadId: threadId });
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      setTyping: (threadId: ID, participantId: ID, isTyping: boolean) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  participants: t.participants.map((p) =>
                    p.id === participantId ? { ...p, isTyping } : p
                  ),
                }
              : t
          ),
        }));
        broadcast({ type: "TYPING", threadId, participantId, isTyping });
      },

      setPresence: (participantId: ID, isOnline: boolean) => {
        set((state) => ({
          threads: state.threads.map((t) => ({
            ...t,
            participants: t.participants.map((p) =>
              p.id === participantId ? { ...p, isOnline } : p
            ),
          })),
        }));
        broadcast({ type: "PRESENCE", participantId, isOnline });
      },

      markAsRead: (threadId: ID, participantId: ID) => {
        const now = Date.now();
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  readReceipts: t.readReceipts.map((r) =>
                    r.participantId === participantId
                      ? { ...r, lastReadTimestamp: now }
                      : r
                  ),
                }
              : t
          ),
        }));
        broadcast({ type: "READ_RECEIPT", threadId, participantId, timestamp: now });
      },

      getUnreadCount: (threadId: ID, participantId: ID) => {
        const thread = get().getThread(threadId);
        if (!thread) return 0;
        const receipt = thread.readReceipts.find((r) => r.participantId === participantId);
        if (!receipt) return thread.messages.length;
        return thread.messages.filter(
          (m) => m.timestamp > receipt.lastReadTimestamp && m.senderId !== participantId
        ).length;
      },

      applyRemoteTyping: (threadId: ID, participantId: ID, isTyping: boolean) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  participants: t.participants.map((p) =>
                    p.id === participantId ? { ...p, isTyping } : p
                  ),
                }
              : t
          ),
        }));
      },

      applyRemotePresence: (participantId: ID, isOnline: boolean) => {
        set((state) => ({
          threads: state.threads.map((t) => ({
            ...t,
            participants: t.participants.map((p) =>
              p.id === participantId ? { ...p, isOnline } : p
            ),
          })),
        }));
      },

      applyRemoteReadReceipt: (threadId: ID, participantId: ID, timestamp: number) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  readReceipts: t.readReceipts.map((r) =>
                    r.participantId === participantId
                      ? { ...r, lastReadTimestamp: timestamp }
                      : r
                  ),
                }
              : t
          ),
        }));
      },

      applyRemoteMessageStatus: (threadId: ID, messageId: ID, status: MessageStatus) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, status } : m
                  ),
                }
              : t
          ),
        }));
      },

      receiveThread: (thread: Thread) => {
        set((state) => {
          if (state.threads.some((t) => t.id === thread.id)) return state;
          return { threads: [...state.threads, thread] };
        });
      },
    }),
    {
      name: "minicom-chat-storage",
      storage: createJSONStorage(() => safeStorage),
      // Only persist threads and darkMode, not transient UI state
      partialize: (state) => ({
        threads: state.threads,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const maxSeq = state.threads.reduce((max, t) =>
          t.messages.reduce((m, msg) => Math.max(m, msg.sequence), max), 0);
        sequenceCounter = maxSeq;
      },
    }
  )
);

/**
 * Simulates sending a message over a network.
 * 10% chance of failure to demonstrate retry behavior.
 */
function simulateSend(
  message: Message,
  get: () => ChatState,
  set: (updater: (state: ChatState) => Partial<ChatState>) => void
) {
  setTimeout(() => {
    const shouldFail = Math.random() < 0.1; // 10% failure rate

    if (shouldFail) {
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === message.threadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === message.id ? { ...m, status: "failed" as const } : m
                ),
              }
            : t
        ),
      }));
    } else {
      const sentMessage = { ...message, status: "sent" as const };
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === message.threadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === message.id ? sentMessage : m
                ),
              }
            : t
        ),
      }));
      // Broadcast to other tabs
      broadcast({ type: "NEW_MESSAGE", message: sentMessage });
    }
  }, 300 + Math.random() * 500); // 300-800ms simulated latency
}
