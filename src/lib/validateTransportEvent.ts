import { TransportEvent } from "./types";

/** Validates that an unknown value is a well-formed TransportEvent. Returns null for invalid data. */
export function validateTransportEvent(data: unknown): TransportEvent | null {
  if (!data || typeof data !== "object" || !("type" in data)) return null;

  const event = data as Record<string, unknown>;

  switch (event.type) {
    case "NEW_MESSAGE":
      if (!event.message || typeof event.message !== "object") return null;
      {
        const msg = event.message as Record<string, unknown>;
        if (typeof msg.id !== "string" || typeof msg.threadId !== "string" ||
            typeof msg.content !== "string" || typeof msg.sequence !== "number") return null;
      }
      return data as TransportEvent;

    case "MESSAGE_STATUS":
      if (typeof event.messageId !== "string" || typeof event.threadId !== "string" ||
          !["sending", "sent", "failed"].includes(event.status as string)) return null;
      return data as TransportEvent;

    case "NEW_THREAD":
      if (!event.thread || typeof event.thread !== "object") return null;
      {
        const thread = event.thread as Record<string, unknown>;
        if (typeof thread.id !== "string" || typeof thread.visitorName !== "string") return null;
      }
      return data as TransportEvent;

    case "TYPING":
      if (typeof event.threadId !== "string" || typeof event.participantId !== "string" ||
          typeof event.isTyping !== "boolean") return null;
      return data as TransportEvent;

    case "PRESENCE":
      if (typeof event.participantId !== "string" || typeof event.isOnline !== "boolean") return null;
      return data as TransportEvent;

    case "READ_RECEIPT":
      if (typeof event.threadId !== "string" || typeof event.participantId !== "string" ||
          typeof event.timestamp !== "number") return null;
      return data as TransportEvent;

    default:
      return null;
  }
}
