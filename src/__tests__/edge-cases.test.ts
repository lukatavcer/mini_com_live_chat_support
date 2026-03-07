/**
 * Test: Edge Cases
 * Verifies handling of edge cases like duplicate messages,
 * sending to non-existent threads, unread counts, and read receipts.
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

describe("Edge Cases", () => {
  beforeEach(() => {
    useChatStore.setState({ threads: [], activeThreadId: null });
  });

  it("rejects duplicate messages (same ID received twice)", () => {
    const { createThread, receiveMessage } = useChatStore.getState();
    const thread = createThread("Visitor");

    const msg = {
      id: "duplicate-msg",
      threadId: thread.id,
      senderId: "agent-1",
      senderRole: "agent" as const,
      content: "Hello",
      timestamp: Date.now(),
      status: "sent" as const,
      sequence: 1,
    };

    receiveMessage(msg);
    receiveMessage(msg); // duplicate

    const { threads } = useChatStore.getState();
    const updatedThread = threads.find((t) => t.id === thread.id)!;
    expect(updatedThread.messages).toHaveLength(1);
  });

  it("throws when sending to a non-existent thread", () => {
    const { sendMessage } = useChatStore.getState();
    expect(() => sendMessage("non-existent-id", "Hello", "visitor")).toThrow(
      "Thread non-existent-id not found"
    );
  });

  it("tracks unread count correctly and resets on markAsRead", () => {
    const { createThread, receiveMessage, getUnreadCount, markAsRead } =
      useChatStore.getState();
    const thread = createThread("Visitor");

    // Receive 3 messages from the visitor
    for (let i = 1; i <= 3; i++) {
      receiveMessage({
        id: `msg-${i}`,
        threadId: thread.id,
        senderId: thread.visitorId,
        senderRole: "visitor",
        content: `Message ${i}`,
        timestamp: Date.now() - (4 - i) * 100,
        status: "sent",
        sequence: i,
      });
    }

    // Agent should have 3 unread messages
    expect(getUnreadCount(thread.id, "agent-1")).toBe(3);

    // Mark as read
    markAsRead(thread.id, "agent-1");

    // Now unread count should be 0
    expect(useChatStore.getState().getUnreadCount(thread.id, "agent-1")).toBe(0);
  });

  it("ignores messages for non-existent threads", () => {
    const { receiveMessage } = useChatStore.getState();
    const before = useChatStore.getState().threads.length;

    receiveMessage({
      id: "orphan-msg",
      threadId: "nonexistent-thread",
      senderId: "agent-1",
      senderRole: "agent",
      content: "Orphan message",
      timestamp: Date.now(),
      status: "sent",
      sequence: 1,
    });

    // No new threads should be created
    expect(useChatStore.getState().threads.length).toBe(before);
  });
});
