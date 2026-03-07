"use client";

import { useEffect } from "react";
import { Inbox } from "@/components/agent/Inbox";
import { ThreadView } from "@/components/agent/ThreadView";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useTransportSync } from "@/lib/useTransportSync";
import { useChatStore } from "@/lib/store";

/**
 * Agent dashboard page — shows inbox with all conversations
 * and a thread view for the selected conversation.
 * Open the visitor page (/) in another tab and start a chat to see it here.
 */
export default function AgentPage() {
  useTransportSync();
  const darkMode = useChatStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-800 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
                          px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              MiniCom Agent
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Visitor Site
            </a>
            <DarkModeToggle />
          </div>
        </header>

        {/* Main content: inbox + thread view side by side */}
        <div className="flex flex-1 overflow-hidden">
          <Inbox />
          <ThreadView />
        </div>
      </div>
    </ErrorBoundary>
  );
}
