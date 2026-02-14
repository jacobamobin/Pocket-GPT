/**
 * PhaseDiagram - Shows learning phases timeline
 */
export default function PhaseDiagram() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto">
      {/* Title */}
      <text x="100" y="15" fill="#94a3b8" fontSize="9" textAnchor="middle">Learning Phases</text>

      {/* Timeline base */}
      <line x1="15" y1="55" x2="185" y2="55" stroke="#475569" strokeWidth="2" />

      {/* Phase 1: Learning Alphabet */}
      <circle cx="30" cy="55" r="10" fill="#1e293b" stroke="#f87171" strokeWidth="2" />
      <text x="30" y="59" fill="#f87171" fontSize="10" textAnchor="middle" fontWeight="bold">1</text>
      <text x="30" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle">Alphabet</text>
      <text x="30" y="92" fill="#64748b" fontSize="7" textAnchor="middle">0-500</text>

      {/* Phase 2: Common Words */}
      <circle cx="70" cy="55" r="10" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
      <text x="70" y="59" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">2</text>
      <text x="70" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle">Words</text>
      <text x="70" y="92" fill="#64748b" fontSize="7" textAnchor="middle">500-1500</text>

      {/* Phase 3: Grammar */}
      <circle cx="110" cy="55" r="10" fill="#1e293b" stroke="#60A5FA" strokeWidth="2" />
      <text x="110" y="59" fill="#60A5FA" fontSize="10" textAnchor="middle" fontWeight="bold">3</text>
      <text x="110" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle">Grammar</text>
      <text x="110" y="92" fill="#64748b" fontSize="7" textAnchor="middle">1500-3000</text>

      {/* Phase 4: Style */}
      <circle cx="150" cy="55" r="10" fill="#1e293b" stroke="#06B6D4" strokeWidth="2" />
      <text x="150" y="59" fill="#06B6D4" fontSize="10" textAnchor="middle" fontWeight="bold">4</text>
      <text x="150" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle">Style</text>
      <text x="150" y="92" fill="#64748b" fontSize="7" textAnchor="middle">3000+</text>

      {/* Progress indicator */}
      <path d="M 15 55 L 150 55" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* Arrowhead showing direction */}
      <path d="M 175 50 L 180 55 L 175 60" fill="none" stroke="#475569" strokeWidth="1.5" />

      {/* Bottom note */}
      <text x="100" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Training steps →</text>
    </svg>
  )
}
