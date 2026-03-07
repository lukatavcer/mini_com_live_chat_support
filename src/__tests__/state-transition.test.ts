/**
 * Test: State Transition
 * Verifies the Zustand store's core state transitions:
 * creating threads, sending messages, and receiving messages.
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

describe("Chat Store State Transitions", () => {
  beforeEach(() => {
    // Reset store between tests
    useChatStore.setState({ threads: [], activeThreadId: null });
  });

  it("creates a thread with correct initial state", () => {
    const { createThread } = useChatStore.getState();
    const thread = createThread("Alice");

    expect(thread.visitorName).toBe("Alice");
    expect(thread.messages).toHaveLength(0);
    expect(thread.participants).toHaveLength(2);
    expect(thread.participants[0].role).toBe("visitor");
    expect(thread.participants[1].role).toBe("agent");

    const { threads } = useChatStore.getState();
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe(thread.id);
  });

  it("sends a message with optimistic 'sending' status", () => {
    const { createThread, sendMessage } = useChatStore.getState();
    const thread = createThread("Bob");

    const message = sendMessage(thread.id, "Hello!", "visitor");

    expect(message.content).toBe("Hello!");
    expect(message.status).toBe("sending");
    expect(message.senderRole).toBe("visitor");

    const { threads } = useChatStore.getState();
    const updatedThread = threads.find((t) => t.id === thread.id)!;
    expect(updatedThread.messages).toHaveLength(1);
    expect(updatedThread.messages[0].status).toBe("sending");
  });

  it("receives a message and inserts it in sequence order", () => {
    const { createThread, receiveMessage } = useChatStore.getState();
    const thread = createThread("Charlie");

    // Receive messages out of order
    receiveMessage({
      id: "msg-2",
      threadId: thread.id,
      senderId: "agent-1",
      senderRole: "agent",
      content: "Second message",
      timestamp: Date.now() + 1000,
      status: "sent",
      sequence: 2,
    });

    receiveMessage({
      id: "msg-1",
      threadId: thread.id,
      senderId: "agent-1",
      senderRole: "agent",
      content: "First message",
      timestamp: Date.now(),
      status: "sent",
      sequence: 1,
    });

    const { threads } = useChatStore.getState();
    const updatedThread = threads.find((t) => t.id === thread.id)!;
    expect(updatedThread.messages).toHaveLength(2);
    // Messages should be sorted by sequence number
    expect(updatedThread.messages[0].content).toBe("First message");
    expect(updatedThread.messages[1].content).toBe("Second message");
  });
});
