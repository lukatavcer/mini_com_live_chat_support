"use client";

import { useEffect } from "react";
import { ChatWidget } from "@/components/visitor/ChatWidget";
import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useTransportSync } from "@/lib/useTransportSync";
import { useChatStore } from "@/lib/store";

/**
 * Visitor page — a mock website with a floating chat widget.
 * Open this page in one tab and /agent in another to see cross-tab messaging.
 */
export default function VisitorPage() {
  useTransportSync();
  const darkMode = useChatStore((s) => s.darkMode);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50
                      dark:from-gray-900 dark:to-gray-800 transition-colors">
        {/* Mock website header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">MiniCom</h1>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/agent" className="text-sm text-blue-600 dark:text-blue-400 hover:underline
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                Agent Dashboard
              </a>
              <DarkModeToggle />
            </nav>
          </div>
        </header>

        {/* Mock website content */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to our platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              This is a mock website demonstrating the MiniCom live chat support widget.
              Click the chat button in the bottom-right corner to start a conversation
              with our support team.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Open the{" "}
              <a href="/agent" className="text-blue-600 dark:text-blue-400 underline">
                Agent Dashboard
              </a>{" "}
              in another tab to see messages appear in real time.
            </p>

            {/* Feature cards for visual interest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
              {[
                { title: "Real-time Chat", desc: "Messages sync instantly between visitor and agent via BroadcastChannel." },
                { title: "Message States", desc: "See sending, sent, and failed states with retry support." },
                { title: "Typing Indicators", desc: "Debounced typing indicators show when someone is composing." },
                { title: "Dark Mode", desc: "Toggle dark mode from the header for a comfortable viewing experience." },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                            dark:border-gray-700 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Chat widget */}
        <ChatWidget />
      </div>
    </ErrorBoundary>
  );
}
