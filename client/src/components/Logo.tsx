import React from 'react';

export function Logo({ className = "", size = "default" }: { className?: string, size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-6",
    default: "h-8",
    large: "h-12"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 128 128"
        className={`${sizeClasses[size]} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M64 16C38.4 16 16 38.4 16 64v48c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V64c0-25.6-22.4-48-48-48zm32 88c0 4.4-3.6 8-8 8H40c-4.4 0-8-3.6-8-8V64c0-17.6 14.4-32 32-32s32 14.4 32 32v40z"
          fill="#10b981"
        />
        <circle cx="48" cy="64" r="8" fill="#10b981" />
        <circle cx="80" cy="64" r="8" fill="#10b981" />
        <path
          d="M64 88c-8.8 0-16-7.2-16-16h32c0 8.8-7.2 16-16 16z"
          fill="#10b981"
        />
      </svg>
      <span className={`font-bold tracking-tight text-foreground ${
        size === "small" ? "text-lg" : 
        size === "large" ? "text-3xl" : 
        "text-2xl"
      }`}>
        GreenGhost <span className="text-emerald-600">Tech</span>
      </span>
    </div>
  );
}
