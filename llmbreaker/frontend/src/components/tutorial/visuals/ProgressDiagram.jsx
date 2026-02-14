/**
 * ProgressDiagram - Shows loss curve going down
 */
export default function ProgressDiagram() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto">
      {/* Axes */}
      <line x1="20" y1="100" x2="180" y2="100" stroke="#475569" strokeWidth="2" />
      <line x1="20" y1="100" x2="20" y2="20" stroke="#475569" strokeWidth="2" />

      {/* Axis labels */}
      <text x="170" y="115" fill="#64748b" fontSize="10">steps</text>
      <text x="5" y="30" fill="#64748b" fontSize="10" transform="rotate(-90, 10, 30)">loss</text>

      {/* Loss curve - starts high, goes down smoothly */}
      <path
        d="M 25 30 Q 40 70, 60 80 Q 90 88, 120 92 Q 150 94, 175 95"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Glow effect under curve */}
      <path
        d="M 25 30 Q 40 70, 60 80 Q 90 88, 120 92 Q 150 94, 175 95 L 175 100 L 25 100 Z"
        fill="url(#gradient)"
        opacity="0.3"
      />

      {/* Dots showing checkpoints */}
      <circle cx="25" cy="30" r="4" fill="#60A5FA" />
      <circle cx="60" cy="80" r="4" fill="#60A5FA" />
      <circle cx="120" cy="92" r="4" fill="#60A5FA" />
      <circle cx="175" cy="95" r="4" fill="#06B6D4" />

      {/* Annotations */}
      <text x="25" y="20" fill="#f87171" fontSize="9" textAnchor="middle">high</text>
      <text x="175" y="85" fill="#4ade80" fontSize="9" textAnchor="middle">low</text>

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
