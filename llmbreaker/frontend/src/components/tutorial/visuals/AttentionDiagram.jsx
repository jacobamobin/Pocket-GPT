/**
 * AttentionDiagram - Shows attention pattern grid
 */
export default function AttentionDiagram() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto">
      {/* Title */}
      <text x="100" y="15" fill="#94a3b8" fontSize="9" textAnchor="middle">Attention Heads</text>

      {/* Grid of attention cells (4x4) */}
      <g transform="translate(30, 25)">
        {/* Row 1 */}
        <rect x="0" y="0" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
        <rect x="25" y="0" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="50" y="0" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
        <rect x="75" y="0" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />

        {/* Row 2 */}
        <rect x="0" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="25" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
        <rect x="50" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="75" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />

        {/* Row 3 */}
        <rect x="0" y="50" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
        <rect x="25" y="50" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="50" y="50" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="75" y="50" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />

        {/* Row 4 */}
        <rect x="0" y="75" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="25" y="75" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
        <rect x="50" y="75" width="20" height="20" rx="3" fill="#1e293b" stroke="#06B6D4" strokeWidth="1" />
        <rect x="75" y="75" width="20" height="20" rx="3" fill="#1e293b" stroke="#60A5FA" strokeWidth="1" />
      </g>

      {/* Labels */}
      <text x="130" y="45" fill="#64748b" fontSize="9">Each cell =</text>
      <text x="130" y="58" fill="#06B6D4" fontSize="9">one head</text>
      <text x="130" y="75" fill="#64748b" fontSize="9">Brighter =</text>
      <text x="130" y="88" fill="#60A5FA" fontSize="9">stronger focus</text>

      {/* Arrow pointing to a cell */}
      <path d="M 125 65 Q 115 65, 75 45" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
    </svg>
  )
}
