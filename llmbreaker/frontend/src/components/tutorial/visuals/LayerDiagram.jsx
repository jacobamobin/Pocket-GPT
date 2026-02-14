/**
 * LayerDiagram - Shows stacked layers concept
 */
export default function LayerDiagram() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto">
      {/* Title */}
      <text x="100" y="15" fill="#94a3b8" fontSize="9" textAnchor="middle">Transformer Layers</text>

      {/* Layer 3 (top) */}
      <g transform="translate(40, 20)">
        <rect width="120" height="18" rx="4" fill="#1e3a5f" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="60" y="13" fill="#60A5FA" fontSize="9" textAnchor="middle" fontWeight="bold">Layer 3 - Abstract Meaning</text>
      </g>

      {/* Arrow down */}
      <path d="M 100 42 L 100 48" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Layer 2 */}
      <g transform="translate(40, 50)">
        <rect width="120" height="18" rx="4" fill="#1e3a5f" stroke="#06B6D4" strokeWidth="1.5" />
        <text x="60" y="13" fill="#06B6D4" fontSize="9" textAnchor="middle" fontWeight="bold">Layer 2 - Relationships</text>
      </g>

      {/* Arrow down */}
      <path d="M 100 72 L 100 78" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Layer 1 (bottom) */}
      <g transform="translate(40, 80)">
        <rect width="120" height="18" rx="4" fill="#1e3a5f" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="60" y="13" fill="#60A5FA" fontSize="9" textAnchor="middle" fontWeight="bold">Layer 1 - Tokens & Patterns</text>
      </g>

      {/* Input arrow */}
      <path d="M 100 104 L 100 110" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="100" y="118" fill="#64748b" fontSize="8" textAnchor="middle">Input Tokens</text>

      {/* Side note */}
      <text x="15" y="60" fill="#64748b" fontSize="8" transform="rotate(-90, 15, 60)">Deeper → More abstract</text>

      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 8 2.5, 0 5" fill="#475569" />
        </marker>
      </defs>
    </svg>
  )
}
