import React from 'react';

interface TheRoadMarkProps {
  size?: number;
  mono?: boolean;
  className?: string;
}

export default function TheRoadMark({ size = 40, mono = false, className = '' }: TheRoadMarkProps) {
  const goldColor = '#D4AF37';
  const greyColor = '#8A8A8A';
  const seamColor = mono ? greyColor : goldColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Horizon base line */}
      <line x1="20" y1="20" x2="180" y2="20" stroke="#3D3A36" strokeWidth="1" />

      {/* Trapezoidal Road */}
      <path
        d="M 30 180 L 88 20 L 112 20 L 170 180 Z"
        fill="#2A2622"
        stroke="#423E3A"
        strokeWidth="2"
      />

      {/* Faint dashed center line */}
      <line
        x1="100"
        y1="180"
        x2="100"
        y2="20"
        stroke="#5A5550"
        strokeWidth="2"
        strokeDasharray="6 6"
      />

      {/* Irregular hand-repaired Kintsugi gold seam */}
      <path
        d="M 100 20 Q 99 35 101 50 T 97 80 T 103 115 T 98 145 T 100 180"
        stroke={seamColor}
        strokeWidth={size < 30 ? 6 : 3.5} // Thicken at small sizes
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gold offshoot crack 1 */}
      <path
        d="M 101 50 Q 112 55 118 52"
        stroke={seamColor}
        strokeWidth={size < 30 ? 5 : 2.5}
        strokeLinecap="round"
      />

      {/* Gold offshoot crack 2 */}
      <path
        d="M 97 80 Q 86 85 80 82"
        stroke={seamColor}
        strokeWidth={size < 30 ? 5 : 2.5}
        strokeLinecap="round"
      />

      {/* Gold offshoot crack 3 */}
      <path
        d="M 103 115 Q 114 122 120 120"
        stroke={seamColor}
        strokeWidth={size < 30 ? 5 : 2.5}
        strokeLinecap="round"
      />

      {/* Gold dot at the horizon point where the seam begins */}
      <circle
        cx="100"
        cy="20"
        r={size < 30 ? 6 : 4.5}
        fill={seamColor}
      />
    </svg>
  );
}
