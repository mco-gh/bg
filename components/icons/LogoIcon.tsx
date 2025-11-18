import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    role="img"
    aria-label="mcoBG Logo"
    {...props}
  >
    {/* Background Circle (Optional, mostly for app icon context) */}
    <circle cx="50" cy="50" r="48" fill="#111827" stroke="#374151" strokeWidth="2" />

    {/* Cyan Point (Top Left) */}
    <path d="M50 50 L20 20 H45 Z" fill="#06b6d4" />
    <path d="M35 20 L50 50 L65 20 Z" fill="#0891b2" opacity="0.8" />

    {/* Orange Point (Bottom Right) */}
    <path d="M50 50 L80 80 H55 Z" fill="#f97316" />
    <path d="M65 80 L50 50 L35 80 Z" fill="#ea580c" opacity="0.8" />

    {/* Central Checker */}
    <circle cx="50" cy="50" r="14" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
    
    {/* Inner Checker Detail */}
    <circle cx="50" cy="50" r="10" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);
