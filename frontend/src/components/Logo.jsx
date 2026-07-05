import React, { useId } from 'react';

export default function Logo({ className, size = 28 }) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      {/* Route paths forming dynamic stylized F & F */}
      <path
        d="M8 20V12H24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V24H20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="12" r="3" fill="#14B8A6" />
      <circle cx="20" cy="24" r="3" fill="#F97316" />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
      </defs>
    </svg>
  );
}

