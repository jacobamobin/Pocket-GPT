import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LinePath } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { localPoint } from '@visx/event'

const MARGIN = { top: 16, right: 24, bottom: 40, left: 52 }

const ANNOTATIONS = [
  { step: 50,  label: 'Random noise' },
  { step: 200, label: 'Learning bigrams' },
  { step: 400, label: 'Picking up patterns' },
]

export default function LossCurveChart({ lossHistory = [], maxIters = 500, onHoverStep }) {
  const [tooltip, setTooltip] = useState(null)   // { x, y, step, train, val }
  const [hovered, setHovered] = useState(false)

  const W = 680, H = 240
  const innerW = W - MARGIN.left - MARGIN.right
  const innerH = H - MARGIN.top  - MARGIN.bottom

  const xScale = useMemo(() => scaleLinear({
    domain: [0, maxIters],
    range:  [0, innerW],
  }), [maxIters, innerW])

  const allLosses = lossHistory.flatMap(d => [d.train_loss, d.val_loss]).filter(Boolean)
  const yMax = allLosses.length ? Math.min(Math.max(...allLosses) * 1.1, 5) : 4.5
  const yMin = allLosses.length ? Math.max(Math.min(...allLosses) * 0.9, 0) : 0

  const yScale = useMemo(() => scaleLinear({
    domain: [yMin, yMax],
    range:  [innerH, 0],
    nice:   true,
  }), [yMin, yMax, innerH])

  const handleMouseMove = useCallback((e) => {
    const pt = localPoint(e.currentTarget, e)
    if (!pt || lossHistory.length < 2) return
    const xVal = xScale.invert(pt.x - MARGIN.left)
    const closest = lossHistory.reduce((a, b) =>
      Math.abs(b.step - xVal) < Math.abs(a.step - xVal) ? b : a
    )
    const cx = MARGIN.left + xScale(closest.step)
    const cy = MARGIN.top  + yScale(closest.train_loss)
    setTooltip({ x: cx, y: cy, ...closest })
    onHoverStep?.(closest.step)
  }, [lossHistory, xScale, yScale, onHoverStep])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHovered(false)
    onHoverStep?.(null)
  }, [onHoverStep])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Loss Curve</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-blue-500 inline-block" />Train
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-cyan-400 border-dashed inline-block" style={{ borderTop: '2px dashed #22d3ee', height: 0 }} />Val
          </span>
        </div>
      </div>

      {lossHistory.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
          Start training to see the loss curve
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            width={W} height={H}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="cursor-crosshair"
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Grid */}
              <GridRows
                scale={yScale} width={innerW} numTicks={5}
                stroke="#1e3a5f" strokeOpacity={0.5}
              />

              {/* Milestone annotations */}
              {ANNOTATIONS.filter(a => lossHistory.some(d => d.step >= a.step)).map(a => (
                <g key={a.step} transform={`translate(${xScale(a.step)},0)`}>
                  <line y1={0} y2={innerH} stroke="#1e3a5f" strokeDasharray="3,3" />
                  <text
                    y={-4} textAnchor="middle"
                    fill="#334155" fontSize={9} fontFamily="monospace"
                  >{a.label}</text>
                </g>
              ))}

              {/* Val loss (dashed cyan) */}
              <LinePath
                data={lossHistory}
                x={d => xScale(d.step)}
                y={d => yScale(d.val_loss)}
                stroke="#22d3ee"
                strokeWidth={1.5}
                strokeDasharray="4,3"
                strokeOpacity={0.7}
              />

              {/* Train loss (solid blue) */}
              <LinePath
                data={lossHistory}
                x={d => xScale(d.step)}
                y={d => yScale(d.train_loss)}
                stroke="#3b82f6"
                strokeWidth={2}
              />

              {/* Animate latest point */}
              {lossHistory.length > 0 && (() => {
                const last = lossHistory[lossHistory.length - 1]
                return (
                  <circle
                    cx={xScale(last.step)}
                    cy={yScale(last.train_loss)}
                    r={3} fill="#60a5fa"
                  />
                )
              })()}

              {/* Crosshair */}
              {tooltip && (
                <g>
                  <line
                    x1={tooltip.x - MARGIN.left} y1={0}
                    x2={tooltip.x - MARGIN.left} y2={innerH}
                    stroke="#3b82f6" strokeOpacity={0.4} strokeWidth={1}
                  />
                  <circle
                    cx={tooltip.x - MARGIN.left}
                    cy={yScale(tooltip.train_loss)}
                    r={4} fill="#3b82f6" stroke="#0d1b2a" strokeWidth={2}
                  />
                </g>
              )}

              {/* Axes */}
              <AxisBottom
                top={innerH} scale={xScale} numTicks={6}
                stroke="#1e3a5f" tickStroke="#1e3a5f"
                tickLabelProps={() => ({ fill: '#475569', fontSize: 10, textAnchor: 'middle', fontFamily: 'monospace' })}
                label="Training Step"
                labelProps={{ fill: '#475569', fontSize: 10, textAnchor: 'middle', dy: 28 }}
              />
              <AxisLeft
                scale={yScale} numTicks={5}
                stroke="#1e3a5f" tickStroke="#1e3a5f"
                tickLabelProps={() => ({ fill: '#475569', fontSize: 10, textAnchor: 'end', dx: -4, fontFamily: 'monospace' })}
                label="Loss"
                labelProps={{ fill: '#475569', fontSize: 10, textAnchor: 'middle', transform: 'rotate(-90)', dx: -innerH/2, dy: -40 }}
              />
            </g>

            {/* Tooltip box */}
            <AnimatePresence>
              {tooltip && (
                <motion.g
                  key="tip"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {(() => {
                    const bx = Math.min(tooltip.x + 10, W - 120)
                    const by = Math.max(tooltip.y - 42, 8)
                    return (
                      <g transform={`translate(${bx},${by})`}>
                        <rect width={110} height={38} rx={4} fill="#0d1b2a" stroke="#1e3a5f" />
                        <text x={8} y={14} fill="#93c5fd" fontSize={10} fontFamily="monospace">
                          Step {tooltip.step}
                        </text>
                        <text x={8} y={28} fill="#60a5fa" fontSize={10} fontFamily="monospace">
                          Loss {tooltip.train_loss?.toFixed(4)}
                        </text>
                      </g>
                    )
                  })()}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>
      )}
    </div>
  )
}
