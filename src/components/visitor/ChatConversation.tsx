"use client";

import { useCallback } from "react";
import { useChatStore } from "@/lib/store";
import { VirtualizedMessageList } from "@/components/shared/VirtualizedMessageList";
import { MessageInput } from "@/components/shared/MessageInput";
import { useTypingBroadcast } from "@/lib/useTypingBroadcast";
import { isRoleTyping, getParticipant } from "@/lib/selectors";
import { Thread, Message } from "@/lib/types";

interface ChatConversationProps {
  thread: Thread;
}

/** Active chat conversation view with message list and input */
export function ChatConversation({ thread }: ChatConversationProps) {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const messages = thread.messages;
  const agentTyping = isRoleTyping(thread, "agent");
  const visitor = getParticipant(thread, "visitor");

  const { updateTyping } = useTypingBroadcast(thread.id, visitor?.id ?? null);
  const isOwnMessage = useCallback((msg: Message) => msg.senderRole === "visitor", []);

  const handleSend = (text: string) => {
    sendMessage(thread.id, text, "visitor");
    updateTyping(false);
  };

  return (
    <>
      <VirtualizedMessageList
        messages={messages}
        isOwnMessage={isOwnMessage}
        typingName={agentTyping ? "Agent" : null}
        ariaLabel="Chat messages"
      />
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <MessageInput
          onSend={handleSend}
          onTypingChange={updateTyping}
          placeholder="Type a message..."
          buttonVariant="icon"
          ariaLabel="Type a message"
        />
      </div>
    </>
  );
}
