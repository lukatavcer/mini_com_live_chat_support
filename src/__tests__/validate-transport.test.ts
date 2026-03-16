/**
 * Test: Transport Event Validation
 * Verifies that malformed events are rejected and valid events pass through.
 */

import { validateTransportEvent } from "@/lib/validateTransportEvent";

describe("validateTransportEvent", () => {
  it("rejects null/undefined/primitives", () => {
    expect(validateTransportEvent(null)).toBeNull();
    expect(validateTransportEvent(undefined)).toBeNull();
    expect(validateTransportEvent("string")).toBeNull();
    expect(validateTransportEvent(42)).toBeNull();
  });

  it("rejects objects without a type field", () => {
    expect(validateTransportEvent({ foo: "bar" })).toBeNull();
  });

  it("rejects unknown event types", () => {
    expect(validateTransportEvent({ type: "UNKNOWN_EVENT" })).toBeNull();
  });

  it("validates NEW_MESSAGE events", () => {
    const valid = {
      type: "NEW_MESSAGE",
      message: {
        id: "1",
        threadId: "t1",
        senderId: "s1",
        senderRole: "visitor",
        content: "hi",
        timestamp: 123,
        status: "sent",
        sequence: 1,
      },
    };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(validateTransportEvent({ type: "NEW_MESSAGE", message: null })).toBeNull();
    expect(validateTransportEvent({ type: "NEW_MESSAGE", message: { id: 123 } })).toBeNull();
  });

  it("validates MESSAGE_STATUS events", () => {
    const valid = { type: "MESSAGE_STATUS", messageId: "m1", threadId: "t1", status: "sent" };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(
      validateTransportEvent({
        type: "MESSAGE_STATUS",
        messageId: "m1",
        threadId: "t1",
        status: "invalid",
      })
    ).toBeNull();
  });

  it("validates TYPING events", () => {
    const valid = { type: "TYPING", threadId: "t1", participantId: "p1", isTyping: true };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(validateTransportEvent({ type: "TYPING", threadId: "t1" })).toBeNull();
  });

  it("validates PRESENCE events", () => {
    const valid = { type: "PRESENCE", participantId: "p1", isOnline: true };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(validateTransportEvent({ type: "PRESENCE", participantId: 123 })).toBeNull();
  });

  it("validates READ_RECEIPT events", () => {
    const valid = { type: "READ_RECEIPT", threadId: "t1", participantId: "p1", timestamp: 123 };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(validateTransportEvent({ type: "READ_RECEIPT", threadId: "t1" })).toBeNull();
  });

  it("validates NEW_THREAD events", () => {
    const valid = {
      type: "NEW_THREAD",
      thread: { id: "t1", visitorName: "Alice", messages: [], participants: [], readReceipts: [] },
    };
    expect(validateTransportEvent(valid)).toEqual(valid);
    expect(validateTransportEvent({ type: "NEW_THREAD", thread: { id: 123 } })).toBeNull();
  });
});
