import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniCom - Live Chat Support",
  description:
    "A live customer support chat prototype built with Next.js, React, and Tailwind CSS.",
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * Inline script that runs before React hydration to apply the dark mode
 * class immediately, preventing a flash of wrong theme on load.
 * Reads from the Zustand persisted store in localStorage.
 */
const darkModeScript = `
  try {
    const stored = JSON.parse(localStorage.getItem('minicom-chat-storage') || '{}');
    if (stored.state && stored.state.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
