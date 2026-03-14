"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

/** Generic empty state placeholder with optional icon */
export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
      <div className="text-center">
        {icon && <div className="mx-auto mb-4 opacity-30">{icon}</div>}
        <p className="text-sm">{title}</p>
        {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
