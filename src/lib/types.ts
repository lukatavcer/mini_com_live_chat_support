/**
 * Core data model for MiniCom live chat support.
 *
 * Defines the structure for threads, messages, participants,
 * and all metadata needed for real-time chat functionality.
 */

/** Unique identifier type alias for clarity */
export type ID = string;

/** Delivery lifecycle of a message */
export type MessageStatus = "sending" | "sent" | "failed";

/** Who is participating in a conversation */
export type ParticipantRole = "visitor" | "agent";

/** A participant in a conversation thread */
export interface Participant {
  id: ID;
  role: ParticipantRole;
  name: string;
  /** Whether the participant is currently online */
  isOnline: boolean;
  /** Whether the participant is currently typing */
  isTyping: boolean;
}

/** A single chat message */
export interface Message {
  id: ID;
  threadId: ID;
  senderId: ID;
  senderRole: ParticipantRole;
  content: string;
  timestamp: number;
  status: MessageStatus;
  /** Sequence number for out-of-order message handling */
  sequence: number;
}

/** Read receipt tracking per participant */
export interface ReadReceipt {
  participantId: ID;
  /** Timestamp of the last message read */
  lastReadTimestamp: number;
}

/** A conversation thread between a visitor and agent(s) */
export interface Thread {
  id: ID;
  visitorId: ID;
  visitorName: string;
  messages: Message[];
  participants: Participant[];
  readReceipts: ReadReceipt[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Events sent over the transport layer (BroadcastChannel).
 * Each event type carries the data needed to sync state across tabs.
 */
export type TransportEvent =
  | { type: "NEW_MESSAGE"; message: Message }
  | { type: "MESSAGE_STATUS"; messageId: ID; threadId: ID; status: MessageStatus }
  | { type: "NEW_THREAD"; thread: Thread }
  | { type: "TYPING"; threadId: ID; participantId: ID; isTyping: boolean }
  | { type: "PRESENCE"; participantId: ID; isOnline: boolean }
  | { type: "READ_RECEIPT"; threadId: ID; participantId: ID; timestamp: number };
