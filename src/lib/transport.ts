/**
 * Transport layer using BroadcastChannel API.
 *
 * Enables cross-tab communication between the visitor app and agent app.
 * Falls back to localStorage events for browsers without BroadcastChannel support.
 */

import { TransportEvent } from "./types";
import { validateTransportEvent } from "./validateTransportEvent";

const CHANNEL_NAME = "minicom-transport";

type EventHandler = (event: TransportEvent) => void;

let channel: BroadcastChannel | null = null;
const listeners: Set<EventHandler> = new Set();

/** Dispatch a validated event to all listeners */
function dispatchToListeners(data: unknown): void {
  const event = validateTransportEvent(data);
  if (!event) return;
  listeners.forEach((handler) => handler(event));
}

/** Initialize the BroadcastChannel and wire up the message handler */
function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      dispatchToListeners(event.data);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        channel?.close();
        channel = null;
      });
    }
  }
  return channel;
}

/** Send an event to all other tabs/windows */
export function broadcast(event: TransportEvent): void {
  getChannel().postMessage(event);
}

/** Subscribe to events from other tabs/windows. Returns an unsubscribe function. */
export function subscribe(handler: EventHandler): () => void {
  getChannel(); // ensure channel is initialized
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}
