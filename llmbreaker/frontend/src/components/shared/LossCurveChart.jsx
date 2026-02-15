import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LinePath } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { localPoint } from '@visx/event'

const MARGIN = { top: 16, right: 24, bottom: 40, left: 52 }

const ANNOTATIONS = [
  { step: 500, label: 'Learning patterns' },
  { step: 2000, label: 'Improving' },
  { step: 5000, label: 'Converging' },
]

export default function LossCurveChart({ lossHistory = [], maxIters = 500, onHoverStep, displayStep = null }) {
  const [tooltip, setTooltip] = useState(null)   // { x, y, step, train, val }
  const [hovered, setHovered] = useState(false)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(680)

  const H = 240

  // Update width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 200)
  const innerH = H - MARGIN.top - MARGIN.bottom

  // Calculate perplexity (exp of loss) - more intuitive than raw loss
  const getPerplexity = (loss) => Math.exp(loss).toFixed(1)

  const xScale = useMemo(() => scaleLinear({
    domain: [0, maxIters],
    range: [0, innerW],
  }), [maxIters, innerW])

  const allLosses = lossHistory.flatMap(d => [d.train_loss, d.val_loss]).filter(Boolean)
  const yMax = allLosses.length ? Math.min(Math.max(...allLosses) * 1.1, 5) : 4.5
  const yMin = allLosses.length ? Math.max(Math.min(...allLosses) * 0.9, 0) : 0

  const yScale = useMemo(() => scaleLinear({
    domain: [yMin, yMax],
    range: [innerH, 0],
    nice: true,
  }), [yMin, yMax, innerH])

  const handleMouseMove = useCallback((e) => {
    const pt = localPoint(e.currentTarget, e)
    if (!pt || lossHistory.length < 2) return
    const xVal = xScale.invert(pt.x - MARGIN.left)
    const closest = lossHistory.reduce((a, b) =>
      Math.abs(b.step - xVal) < Math.abs(a.step - xVal) ? b : a
    )
    const cx = MARGIN.left + xScale(closest.step)
    const cy = MARGIN.top + yScale(closest.train_loss)
    setTooltip({ x: cx, y: cy, ...closest })
    onHoverStep?.(closest.step)
  }, [lossHistory, xScale, yScale, onHoverStep])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHovered(false)
    onHoverStep?.(null)
  }, [onHoverStep])

  return (
    <div className="card" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="section-title">Learning Progress</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-gold-base inline-block" />Train
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-gold-light border-dashed inline-block" style={{ borderTop: '2px dashed #c9b8a0', height: 0 }} />Val
          </span>
        </div>
      </div>

      {/* Learning quality indicator */}
      {lossHistory.length > 0 && (
        <div className="mb-3 px-3 py-2 rounded-md bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Latest perplexity:</span>
            <span className="font-mono text-gold-light">
              {getPerplexity(lossHistory[lossHistory.length - 1]?.train_loss || 0)}
            </span>
          </div>
          <div className="text-xs text-white/30 mt-1">
            {(() => {
              const ppl = parseFloat(getPerplexity(lossHistory[lossHistory.length - 1]?.train_loss || 999))
              if (ppl < 5) return 'Excellent - model is learning well!'
              if (ppl < 15) return 'Good - model is picking up patterns'
              if (ppl < 30) return 'Fair - model needs more training'
              return 'Keep training - model is still learning'
            })()}
          </div>
        </div>
      )}

      {lossHistory.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-white/30 text-sm">
          Start training to see the loss curve
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            width={width} height={H}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="cursor-crosshair"
            style={{ display: 'block' }}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Grid */}
              <GridRows
                scale={yScale} width={innerW} numTicks={5}
                stroke="rgba(167,139,113,0.15)" strokeOpacity={1}
              />

              {/* Milestone annotations */}
              {ANNOTATIONS.filter(a => lossHistory.some(d => d.step >= a.step)).map(a => (
                <g key={a.step} transform={`translate(${xScale(a.step)},0)`}>
                  <line y1={0} y2={innerH} stroke="rgba(167,139,113,0.2)" strokeDasharray="3,3" />
                  <text
                    y={-4} textAnchor="middle"
                    fill="rgba(167,139,113,0.4)" fontSize={9} fontFamily="monospace"
                  >{a.label}</text>
                </g>
              ))}

              {/* Val loss (dashed gold-light) */}
              <LinePath
                data={lossHistory}
                x={d => xScale(d.step)}
                y={d => yScale(d.val_loss)}
                stroke="#c9b8a0"
                strokeWidth={1.5}
                strokeDasharray="4,3"
                strokeOpacity={0.7}
              />

              {/* Train loss (solid gold) */}
              <LinePath
                data={lossHistory}
                x={d => xScale(d.step)}
                y={d => yScale(d.train_loss)}
                stroke="#a78b71"
                strokeWidth={2}
              />

              {/* Animate latest point */}
              {lossHistory.length > 0 && (() => {
                const last = lossHistory[lossHistory.length - 1]
                return (
                  <circle
                    cx={xScale(last.step)}
                    cy={yScale(last.train_loss)}
                    r={3} fill="#c9b8a0"
                  />
                )
              })()}

              {/* Pinned displayStep line */}
              {displayStep != null && (
                <line
                  x1={xScale(displayStep)} y1={0}
                  x2={xScale(displayStep)} y2={innerH}
                  stroke="#c9b8a0" strokeDasharray="3 3" strokeOpacity={0.7} strokeWidth={1.5}
                />
              )}

              {/* Crosshair */}
              {tooltip && (
                <g>
                  <line
                    x1={tooltip.x - MARGIN.left} y1={0}
                    x2={tooltip.x - MARGIN.left} y2={innerH}
                    stroke="#a78b71" strokeOpacity={0.4} strokeWidth={1}
                  />
                  <circle
                    cx={tooltip.x - MARGIN.left}
                    cy={yScale(tooltip.train_loss)}
                    r={4} fill="#a78b71" stroke="#0a0a0a" strokeWidth={2}
                  />
                </g>
              )}

              {/* Axes */}
              <AxisBottom
                top={innerH} scale={xScale} numTicks={6}
                stroke="rgba(167,139,113,0.2)" tickStroke="rgba(167,139,113,0.2)"
                tickLabelProps={() => ({ fill: 'rgba(255,255,255,0.3)', fontSize: 10, textAnchor: 'middle', fontFamily: 'monospace' })}
                label="Training Step"
                labelProps={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, textAnchor: 'middle', dy: 28 }}
              />
              <AxisLeft
                scale={yScale} numTicks={5}
                stroke="rgba(167,139,113,0.2)" tickStroke="rgba(167,139,113,0.2)"
                tickLabelProps={() => ({ fill: 'rgba(255,255,255,0.3)', fontSize: 10, textAnchor: 'end', dx: -4, fontFamily: 'monospace' })}
                label="Loss"
                labelProps={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, textAnchor: 'middle', transform: 'rotate(-90)', dx: -innerH / 2, dy: -40 }}
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
                    const bx = Math.min(tooltip.x + 10, width - 120)
                    const by = Math.max(tooltip.y - 42, 8)
                    return (
                      <g transform={`translate(${bx},${by})`}>
                        <rect width={110} height={38} rx={4} fill="#0a0a0a" stroke="rgba(167,139,113,0.3)" />
                        <text x={8} y={14} fill="#c9b8a0" fontSize={10} fontFamily="monospace">
                          Step {tooltip.step}
                        </text>
                        <text x={8} y={28} fill="#a78b71" fontSize={10} fontFamily="monospace">
                          PPL {getPerplexity(tooltip.train_loss || 0)}
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
