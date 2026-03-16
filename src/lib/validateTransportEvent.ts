import { TransportEvent } from "./types";

const MAX_ID_LENGTH = 100;
const MAX_CONTENT_LENGTH = 10_000;
const TIMESTAMP_TOLERANCE_MS = 30_000;

/** Check that an object has fields matching expected types */
function hasFields(obj: unknown, schema: Record<string, string>): boolean {
  if (!obj || typeof obj !== "object") return false;
  const record = obj as Record<string, unknown>;
  return Object.entries(schema).every(([key, type]) => typeof record[key] === type);
}

/** Validate a string field is within length limits */
function isValidString(value: unknown, maxLength: number): boolean {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

/** Validate a timestamp is reasonable */
function isValidTimestamp(value: unknown): boolean {
  return typeof value === "number" && value > 0 && value <= Date.now() + TIMESTAMP_TOLERANCE_MS;
}

/** Validates that an unknown value is a well-formed TransportEvent. Returns null for invalid data. */
export function validateTransportEvent(data: unknown): TransportEvent | null {
  if (!data || typeof data !== "object" || !("type" in data)) return null;

  const event = data as Record<string, unknown>;

  switch (event.type) {
    case "NEW_MESSAGE": {
      const msg = event.message as Record<string, unknown> | undefined;
      if (
        !hasFields(msg, {
          id: "string",
          threadId: "string",
          content: "string",
          sequence: "number",
        })
      )
        return null;
      if (!msg) return null;
      if (!isValidString(msg.id, MAX_ID_LENGTH)) return null;
      if (!isValidString(msg.threadId, MAX_ID_LENGTH)) return null;
      if (!isValidString(msg.content, MAX_CONTENT_LENGTH)) return null;
      return data as TransportEvent;
    }

    case "MESSAGE_STATUS":
      if (
        !hasFields(event, { messageId: "string", threadId: "string" }) ||
        !["sending", "sent", "failed"].includes(event.status as string)
      )
        return null;
      if (!isValidString(event.messageId, MAX_ID_LENGTH)) return null;
      if (!isValidString(event.threadId, MAX_ID_LENGTH)) return null;
      return data as TransportEvent;

    case "NEW_THREAD": {
      const thread = event.thread as Record<string, unknown> | undefined;
      if (!hasFields(thread, { id: "string", visitorName: "string" })) return null;
      if (!thread) return null;
      if (!isValidString(thread.id, MAX_ID_LENGTH)) return null;
      if (!Array.isArray(thread.messages)) return null;
      if (!Array.isArray(thread.participants)) return null;
      if (!Array.isArray(thread.readReceipts)) return null;
      return data as TransportEvent;
    }

    case "TYPING":
      if (!hasFields(event, { threadId: "string", participantId: "string", isTyping: "boolean" }))
        return null;
      if (!isValidString(event.threadId, MAX_ID_LENGTH)) return null;
      if (!isValidString(event.participantId, MAX_ID_LENGTH)) return null;
      return data as TransportEvent;

    case "PRESENCE":
      if (!hasFields(event, { participantId: "string", isOnline: "boolean" })) return null;
      if (!isValidString(event.participantId, MAX_ID_LENGTH)) return null;
      return data as TransportEvent;

    case "READ_RECEIPT":
      if (!hasFields(event, { threadId: "string", participantId: "string", timestamp: "number" }))
        return null;
      if (!isValidString(event.threadId, MAX_ID_LENGTH)) return null;
      if (!isValidString(event.participantId, MAX_ID_LENGTH)) return null;
      if (!isValidTimestamp(event.timestamp)) return null;
      return data as TransportEvent;

    default:
      return null;
  }
}
