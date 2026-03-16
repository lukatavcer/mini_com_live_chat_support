"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/lib/store";
import { VirtualizedMessageList } from "@/components/shared/VirtualizedMessageList";
import { MessageInput } from "@/components/shared/MessageInput";
import { Avatar } from "@/components/shared/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTypingBroadcast } from "@/lib/useTypingBroadcast";
import { getParticipant, isRoleTyping } from "@/lib/selectors";
import { CURRENT_AGENT_ID } from "@/lib/constants";
import { debounce } from "@/lib/utils";
import { Message } from "@/lib/types";

const chatIcon = (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

/**
 * Thread detail view for the agent app.
 * Shows message history and reply input for the selected conversation.
 */
export function ThreadView() {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const threads = useChatStore((s) => s.threads);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const thread = threads.find((t) => t.id === activeThreadId);
  const messages = thread?.messages || [];
  const visitor = thread ? getParticipant(thread, "visitor") : undefined;
  const visitorTyping = isRoleTyping(thread, "visitor");

  const { updateTyping } = useTypingBroadcast(thread?.id ?? null, CURRENT_AGENT_ID);
  const isOwnMessage = useCallback((msg: Message) => msg.senderRole === "agent", []);

  // Stable debounced ref — markAsRead from Zustand is stable, but useRef avoids
  // recreating the debounce on every render
  const debouncedMarkAsRead = useRef(
    debounce((threadId: string, participantId: string) => {
      useChatStore.getState().markAsRead(threadId, participantId);
    }, 300)
  ).current;

  useEffect(() => {
    if (thread) {
      debouncedMarkAsRead(thread.id, CURRENT_AGENT_ID);
    }
  }, [thread?.id, messages.length, debouncedMarkAsRead]);

  // Cancel pending debounce on unmount
  useEffect(() => {
    return () => debouncedMarkAsRead.cancel();
  }, [debouncedMarkAsRead]);

  const handleSend = (text: string) => {
    if (!thread) return;
    sendMessage(thread.id, text, "agent");
    updateTyping(false);
  };

  if (!thread) {
    return <EmptyState icon={chatIcon} title="Select a conversation to start responding" />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <Avatar initials={thread.visitorName[0] || "V"} size="md" isOnline={visitor?.isOnline} />
        <div>
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {thread.visitorName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {visitorTyping ? "Typing..." : visitor?.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <VirtualizedMessageList
        messages={messages}
        isOwnMessage={isOwnMessage}
        typingName={visitorTyping ? thread.visitorName : null}
        ariaLabel="Conversation messages"
      />

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <MessageInput
          onSend={handleSend}
          onTypingChange={updateTyping}
          placeholder="Type your reply..."
          ariaLabel="Reply to conversation"
          autoFocusTrigger={activeThreadId}
        />
      </div>
    </div>
  );
}
