import { useState } from 'react'

const MAX_TOKENS = 16  // show first 16 tokens for readability

/** Maps a 0–1 attention weight to a white→dark-blue color */
function attentionColor(v) {
  const t = Math.max(0, Math.min(1, v))
  const r = Math.round(255 + t * (30  - 255))
  const g = Math.round(255 + t * (58  - 255))
  const b = Math.round(255 + t * (138 - 255))
  return `rgb(${r},${g},${b})`
}

function displayTok(tok) {
  if (tok === ' ')  return '·'
  if (tok === '\n') return '↵'
  return tok
}

/**
 * Renders an attention matrix as a 2D heatmap.
 *
 * @param {object} props
 * @param {number[][]} props.matrix   - NxN attention weights
 * @param {string[]}   props.tokens   - token strings for axis labels
 * @param {'small'|'large'} props.size - overview cell vs. detail view
 */
export default function Heatmap2D({ matrix, tokens = [], size = 'large' }) {
  const [hovered, setHovered] = useState(null)

  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center text-white/20 text-sm w-full h-full min-h-[120px]">
        No data
      </div>
    )
  }

  const N         = Math.min(matrix.length, MAX_TOKENS)
  const sub       = matrix.slice(0, N).map(row => row.slice(0, N))
  const toks      = tokens.slice(0, N)
  const isLarge   = size === 'large'
  const cellSize  = isLarge ? Math.max(10, Math.min(30, Math.floor(440 / N))) : Math.max(4, Math.floor(152 / N))
  const gap       = 1
  const labelPad  = isLarge ? 22 : 0
  const legendW   = isLarge ? 32 : 0
  const svgW      = labelPad + N * (cellSize + gap) + legendW
  const svgH      = labelPad + N * (cellSize + gap)

  return (
    <div className="flex flex-col items-start">
      <svg width={svgW} height={svgH} className={isLarge ? 'cursor-crosshair' : ''}>
        <g transform={`translate(${labelPad},${labelPad})`}>
          {/* Cells */}
          {sub.map((row, r) =>
            row.map((val, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * (cellSize + gap)}
                y={r * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                fill={attentionColor(val)}
                onMouseEnter={isLarge ? () => setHovered({ r, c, val }) : undefined}
                onMouseLeave={isLarge ? () => setHovered(null)           : undefined}
              />
            ))
          )}

          {/* X-axis labels (col = key token) */}
          {isLarge && toks.map((tok, c) => (
            <text
              key={c}
              x={c * (cellSize + gap) + cellSize / 2}
              y={-5}
              fill="#64748b"
              fontSize={9}
              textAnchor="middle"
              fontFamily="monospace"
            >
              {displayTok(tok)}
            </text>
          ))}

          {/* Y-axis labels (row = query token) */}
          {isLarge && toks.map((tok, r) => (
            <text
              key={r}
              x={-4}
              y={r * (cellSize + gap) + cellSize / 2 + 3}
              fill="#64748b"
              fontSize={9}
              textAnchor="end"
              fontFamily="monospace"
            >
              {displayTok(tok)}
            </text>
          ))}
        </g>

        {/* Color scale legend */}
        {isLarge && (() => {
          const lx   = labelPad + N * (cellSize + gap) + 8
          const lh   = N * (cellSize + gap)
          const bars = lh
          return (
            <g transform={`translate(${lx},${labelPad})`}>
              {Array.from({ length: bars }, (_, i) => (
                <rect key={i} x={0} y={i} width={10} height={1} fill={attentionColor(1 - i / bars)} />
              ))}
              <text x={13} y={6}        fill="#64748b" fontSize={8} fontFamily="monospace">1.0</text>
              <text x={13} y={lh/2 + 4} fill="#64748b" fontSize={8} fontFamily="monospace">0.5</text>
              <text x={13} y={lh}       fill="#64748b" fontSize={8} fontFamily="monospace">0.0</text>
            </g>
          )
        })()}
      </svg>

      {/* Hover info */}
      {isLarge && (
        <p className="text-xs text-white/30 font-mono mt-1.5 h-4">
          {hovered
            ? `"${displayTok(toks[hovered.r] || '?')}" attends to "${displayTok(toks[hovered.c] || '?')}" = ${hovered.val.toFixed(4)}`
            : 'Brighter = more attention. Hover for exact values.'}
        </p>
      )}
    </div>
  )
}
