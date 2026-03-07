"use client";

import { Message } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { useChatStore } from "@/lib/store";

interface MessageBubbleProps {
  message: Message;
  /** Whether this message was sent by the current user (affects alignment) */
  isOwn: boolean;
}

/**
 * Reusable message bubble component used by both visitor and agent views.
 * Shows delivery status and supports retry on failure.
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const retryMessage = useChatStore((s) => s.retryMessage);

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}
      role="listitem"
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`flex items-center gap-1.5 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-xs ${
              isOwn ? "text-blue-200" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </span>

          {/* Delivery status indicator (only shown for own messages) */}
          {isOwn && (
            <span className="text-xs" aria-label={`Message ${message.status}`}>
              {message.status === "sending" && (
                <span className="text-blue-200">Sending...</span>
              )}
              {message.status === "sent" && (
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {message.status === "failed" && (
                <button
                  onClick={() => retryMessage(message.threadId, message.id)}
                  className="text-red-300 hover:text-red-100 underline focus:outline-none
                             focus:ring-1 focus:ring-red-300 rounded"
                  aria-label="Retry sending message"
                >
                  Failed - Retry
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
