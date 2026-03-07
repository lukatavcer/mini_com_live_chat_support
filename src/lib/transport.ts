/**
 * Transport layer using BroadcastChannel API.
 *
 * Enables cross-tab communication between the visitor app and agent app.
 * Falls back to localStorage events for browsers without BroadcastChannel support.
 */

import { TransportEvent } from "./types";

const CHANNEL_NAME = "minicom-transport";

type EventHandler = (event: TransportEvent) => void;

let channel: BroadcastChannel | null = null;
const listeners: Set<EventHandler> = new Set();

/** Initialize the BroadcastChannel and wire up the message handler */
function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<TransportEvent>) => {
      listeners.forEach((handler) => handler(event.data));
    };
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
