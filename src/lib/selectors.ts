import { Thread, Participant, ParticipantRole } from "./types";

/** Get the first participant with the given role from a thread */
export function getParticipant(thread: Thread, role: ParticipantRole): Participant | undefined {
  return thread.participants.find((p) => p.role === role);
}

/** Check if a participant with the given role is currently typing */
export function isRoleTyping(thread: Thread | null | undefined, role: ParticipantRole): boolean {
  if (!thread) return false;
  return thread.participants.some((p) => p.role === role && p.isTyping);
}
