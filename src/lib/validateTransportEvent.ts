import { TransportEvent } from "./types";

/** Check that an object has fields matching expected types */
function hasFields(obj: unknown, schema: Record<string, string>): boolean {
  if (!obj || typeof obj !== "object") return false;
  const record = obj as Record<string, unknown>;
  return Object.entries(schema).every(([key, type]) => typeof record[key] === type);
}

/** Validates that an unknown value is a well-formed TransportEvent. Returns null for invalid data. */
export function validateTransportEvent(data: unknown): TransportEvent | null {
  if (!data || typeof data !== "object" || !("type" in data)) return null;

  const event = data as Record<string, unknown>;

  switch (event.type) {
    case "NEW_MESSAGE":
      if (!hasFields(event.message, { id: "string", threadId: "string", content: "string", sequence: "number" }))
        return null;
      return data as TransportEvent;

    case "MESSAGE_STATUS":
      if (!hasFields(event, { messageId: "string", threadId: "string" }) ||
          !["sending", "sent", "failed"].includes(event.status as string)) return null;
      return data as TransportEvent;

    case "NEW_THREAD":
      if (!hasFields(event.thread, { id: "string", visitorName: "string" })) return null;
      return data as TransportEvent;

    case "TYPING":
      if (!hasFields(event, { threadId: "string", participantId: "string", isTyping: "boolean" })) return null;
      return data as TransportEvent;

    case "PRESENCE":
      if (!hasFields(event, { participantId: "string", isOnline: "boolean" })) return null;
      return data as TransportEvent;

    case "READ_RECEIPT":
      if (!hasFields(event, { threadId: "string", participantId: "string", timestamp: "number" })) return null;
      return data as TransportEvent;

    default:
      return null;
  }
}
