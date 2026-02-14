/**
 * DatasetDiagram - Shows text → characters → model flow
 */
export default function DatasetDiagram() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto">
      {/* Document icon */}
      <rect x="10" y="20" width="40" height="50" rx="4" fill="#1e293b" stroke="#60A5FA" strokeWidth="2" />
      <line x1="18" y1="32" x2="42" y2="32" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />
      <line x1="18" y1="42" x2="42" y2="42" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />
      <line x1="18" y1="52" x2="35" y2="52" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />

      {/* Arrow 1 */}
      <path d="M 55 45 L 75 45" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Character tokens */}
      <circle cx="95" cy="35" r="8" fill="#1e293b" stroke="#60A5FA" strokeWidth="1.5" />
      <text x="95" y="39" textAnchor="middle" fill="#60A5FA" fontSize="10" fontFamily="monospace">t</text>
      <circle cx="110" cy="45" r="8" fill="#1e293b" stroke="#60A5FA" strokeWidth="1.5" />
      <text x="110" y="49" textAnchor="middle" fill="#60A5FA" fontSize="10" fontFamily="monospace">h</text>
      <circle cx="95" cy="55" r="8" fill="#1e293b" stroke="#60A5FA" strokeWidth="1.5" />
      <text x="95" y="59" textAnchor="middle" fill="#60A5FA" fontSize="10" fontFamily="monospace">e</text>

      {/* Arrow 2 */}
      <path d="M 125 45 L 145 45" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrowhead2)" />

      {/* Model box */}
      <rect x="150" y="25" width="40" height="40" rx="4" fill="#1e293b" stroke="#60A5FA" strokeWidth="2" />
      <text x="170" y="50" textAnchor="middle" fill="#06B6D4" fontSize="10" fontWeight="bold">GPT</text>

      {/* Arrowhead definitions */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#06B6D4" />
        </marker>
        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#06B6D4" />
        </marker>
      </defs>
    </svg>
  )
}
