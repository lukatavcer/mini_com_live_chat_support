"use client";

const sizeClasses = {
  sm: { avatar: "w-8 h-8", dot: "w-2 h-2" },
  md: { avatar: "w-9 h-9", dot: "w-2.5 h-2.5" },
  lg: { avatar: "w-10 h-10", dot: "w-3 h-3" },
} as const;

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
}

/** Avatar circle with initials and optional online status indicator */
export function Avatar({ initials, size = "md", isOnline }: AvatarProps) {
  const { avatar, dot } = sizeClasses[size];

  return (
    <div className="relative flex-shrink-0" aria-hidden="true">
      <div
        className={`${avatar} bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300
                        rounded-full flex items-center justify-center text-sm font-semibold`}
      >
        {initials.toUpperCase()}
      </div>
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dot} bg-green-500 rounded-full
                          border-2 border-white dark:border-gray-800`}
        />
      )}
    </div>
  );
}
