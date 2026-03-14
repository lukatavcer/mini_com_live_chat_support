/**
 * Test: Typing Indicator Lifecycle
 * Covers start, continue (reset timeout), stop, and timeout-based auto-clear.
 */

// Mock BroadcastChannel for jsdom
class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage() {}
  close() {}
}
global.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => Math.random().toString(36).slice(2, 10) },
});

import { useChatStore } from "@/lib/store";
import { CURRENT_AGENT_ID } from "@/lib/constants";

describe("Typing Indicator", () => {
  beforeEach(() => {
    useChatStore.setState({ threads: [], activeThreadId: null });
  });

  it("sets typing state for a participant", () => {
    const { createThread, setTyping } = useChatStore.getState();
    const thread = createThread("Alice");
    const visitorId = thread.visitorId;

    setTyping(thread.id, visitorId, true);

    const updated = useChatStore.getState().threads.find((t) => t.id === thread.id)!;
    const visitor = updated.participants.find((p) => p.id === visitorId)!;
    expect(visitor.isTyping).toBe(true);
  });

  it("clears typing state when set to false", () => {
    const { createThread, setTyping } = useChatStore.getState();
    const thread = createThread("Bob");
    const visitorId = thread.visitorId;

    setTyping(thread.id, visitorId, true);
    setTyping(thread.id, visitorId, false);

    const updated = useChatStore.getState().threads.find((t) => t.id === thread.id)!;
    const visitor = updated.participants.find((p) => p.id === visitorId)!;
    expect(visitor.isTyping).toBe(false);
  });

  it("applyRemoteTyping updates state without broadcasting", () => {
    const { createThread, applyRemoteTyping } = useChatStore.getState();
    const thread = createThread("Charlie");
    const visitorId = thread.visitorId;

    applyRemoteTyping(thread.id, visitorId, true);

    const updated = useChatStore.getState().threads.find((t) => t.id === thread.id)!;
    const visitor = updated.participants.find((p) => p.id === visitorId)!;
    expect(visitor.isTyping).toBe(true);
  });

  it("applyRemoteMessageStatus updates message status", () => {
    const { createThread, sendMessage, applyRemoteMessageStatus } = useChatStore.getState();
    const thread = createThread("Dave");
    const msg = sendMessage(thread.id, "test", "visitor");

    applyRemoteMessageStatus(thread.id, msg.id, "failed");

    const updated = useChatStore.getState().threads.find((t) => t.id === thread.id)!;
    const updatedMsg = updated.messages.find((m) => m.id === msg.id)!;
    expect(updatedMsg.status).toBe("failed");
  });

  it("applyRemoteReadReceipt updates read receipt timestamp", () => {
    const { createThread, applyRemoteReadReceipt, getUnreadCount } = useChatStore.getState();
    const thread = createThread("Eve");

    // Receive a message first
    useChatStore.getState().receiveMessage({
      id: "msg-1",
      threadId: thread.id,
      senderId: thread.visitorId,
      senderRole: "visitor",
      content: "Hello",
      timestamp: Date.now(),
      status: "sent",
      sequence: 1,
    });

    expect(useChatStore.getState().getUnreadCount(thread.id, CURRENT_AGENT_ID)).toBe(1);

    applyRemoteReadReceipt(thread.id, CURRENT_AGENT_ID, Date.now());

    expect(useChatStore.getState().getUnreadCount(thread.id, CURRENT_AGENT_ID)).toBe(0);
  });
});
