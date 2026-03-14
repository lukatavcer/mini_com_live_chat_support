"use client";

import { DarkModeToggle } from "./DarkModeToggle";

interface AppHeaderProps {
  title: string;
  navLink: { href: string; label: string };
}

/** Shared app header with logo, title, navigation link, and dark mode toggle */
export function AppHeader({ title, navLink }: AppHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
                        px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
      <nav className="flex items-center gap-4">
        <a
          href={navLink.href}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline
                     focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          {navLink.label}
        </a>
        <DarkModeToggle />
      </nav>
    </header>
  );
}
