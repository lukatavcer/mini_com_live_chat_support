"use client";

import { Inbox } from "@/components/agent/Inbox";
import { ThreadView } from "@/components/agent/ThreadView";
import { AppHeader } from "@/components/shared/AppHeader";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useTransportSync } from "@/lib/useTransportSync";
import { useDarkMode } from "@/lib/useDarkMode";

/**
 * Agent dashboard page — shows inbox with all conversations
 * and a thread view for the selected conversation.
 */
export default function AgentPage() {
  useTransportSync();
  useDarkMode();

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-800 transition-colors">
        <AppHeader title="MiniCom Agent" navLink={{ href: "/", label: "Visitor Site" }} />

        <div className="flex flex-1 overflow-hidden">
          <Inbox />
          <ThreadView />
        </div>
      </div>
    </ErrorBoundary>
  );
}
