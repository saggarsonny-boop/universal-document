'use client'

interface UDIconProps {
  type: 'UDS' | 'UDR'
  size?: number
  className?: string
}

export default function UDIcon({ type, size = 48, className }: UDIconProps) {
  const isSealed = type === 'UDS'
  const deepBlue = '#003A8C'
  const lightBlue = '#4DA3FF'
  const accent = isSealed ? deepBlue : lightBlue
  const badgeLetter = isSealed ? 'S' : 'R'

  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Document body */}
      <rect x="2" y="2" width="36" height="48" rx="5" fill="white" stroke={accent} strokeWidth="1.5" />

      {/* Dog-ear fold */}
      <path d="M26 2 L38 14 L26 14 Z" fill={accent} opacity="0.15" />
      <path d="M26 2 L26 14 L38 14" fill="none" stroke={accent} strokeWidth="1.5" />

      {/* UD watermark — large, low opacity */}
      <text
        x="20" y="34"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontWeight="800"
        fontSize="22"
        fill={accent}
        opacity="0.10"
      >
        UD
      </text>

      {/* Content lines */}
      <rect x="7" y="20" width="18" height="2" rx="1" fill={accent} opacity="0.25" />
      <rect x="7" y="25" width="22" height="2" rx="1" fill={accent} opacity="0.15" />
      <rect x="7" y="30" width="14" height="2" rx="1" fill={accent} opacity="0.15" />

      {/* Corner badge */}
      <circle cx="34" cy="42" r="7" fill={accent} />
      <text
        x="34" y="46"
        textAnchor="middle"
        fontFamily="-apple-system, sans-serif"
        fontWeight="800"
        fontSize="8"
        fill="white"
      >
        {badgeLetter}
      </text>

      {/* Sealed lock icon for UDS */}
      {isSealed && (
        <g transform="translate(6, 37)">
          <rect x="1" y="3" width="8" height="6" rx="1" fill={deepBlue} opacity="0.6" />
          <path d="M3 3 C3 1.3 7 1.3 7 3" stroke={deepBlue} strokeWidth="1.2" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Edit pencil for UDR */}
      {!isSealed && (
        <g transform="translate(6, 37)">
          <path d="M1 8 L6 2 L9 5 L4 9 Z" fill={lightBlue} opacity="0.6" />
          <path d="M1 8 L0 10 L2 9 Z" fill={lightBlue} opacity="0.6" />
        </g>
      )}
    </svg>
  )
}
