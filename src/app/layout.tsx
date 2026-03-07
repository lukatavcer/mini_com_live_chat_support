import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniCom - Live Chat Support",
  description: "A live customer support chat prototype built with Next.js, React, and Tailwind CSS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
