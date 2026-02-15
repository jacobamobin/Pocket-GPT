import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function softmax(logits, temperature) {
  const t = Math.max(temperature, 0.01)
  const scaled = logits.map(l => l / t)
  const maxVal = Math.max(...scaled)
  const exps = scaled.map(l => Math.exp(l - maxVal))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function displayChar(ch) {
  if (ch === ' ') return '␣'
  if (ch === '\n') return '↵'
  if (ch === '\t') return '⇥'
  return ch
}

const CANDIDATE_COLORS = [
  { bg: 'bg-gold-subtle', border: 'border-gold-base/60', text: 'text-gold-light' },
  { bg: 'bg-gold-subtle', border: 'border-gold-muted', text: 'text-gold-base' },
  { bg: 'bg-white/[0.05]', border: 'border-white/20', text: 'text-white/60' },
  { bg: 'bg-white/[0.03]', border: 'border-white/15', text: 'text-white/40' },
  { bg: 'bg-white/[0.02]', border: 'border-white/10', text: 'text-white/30' },
]

export default function ProbabilityTower({ tokenProbabilities = [], samples = [], className = '' }) {
  const [temperature, setTemperature] = useState(0.8)

  const latest = tokenProbabilities.length > 0
    ? tokenProbabilities[tokenProbabilities.length - 1]
    : null

  const top5 = useMemo(() => {
    if (!latest) return []
    const { logits, vocab } = latest
    const probs = softmax(logits, temperature)
    const pairs = probs.map((p, i) => ({ char: vocab[i] ?? '?', prob: p, idx: i }))
    pairs.sort((a, b) => b.prob - a.prob)
    return pairs.slice(0, 5)
  }, [latest, temperature])

  const generatedText = useMemo(() => {
    if (!latest || !samples.length) return ''
    const match = samples.find(s => s.step === latest.step)
    return match?.text ?? ''
  }, [latest, samples])

  // Last ~50 chars of context to show
  const contextWindow = generatedText ? generatedText.slice(-50) : ''

  const tempLabel = useMemo(() => {
    if (temperature < 0.3) return 'Near-greedy — nearly always picks the argmax token'
    if (temperature < 0.7) return 'Low entropy — distribution is sharply peaked'
    if (temperature < 1.1) return 'Balanced — moderate entropy, mix of likely and unlikely tokens'
    if (temperature < 1.8) return 'High entropy — distribution is flattened, more stochasticity'
    return 'Near-uniform — logits are heavily smoothed, near-random sampling'
  }, [temperature])

  if (!latest) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="section-title">
            Next-Token Prediction
          </h3>
        </div>
        <div className="flex items-center justify-center h-28 text-white/30 text-sm">
          Predictions will appear during training
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="section-title">
            Next-Token Prediction
          </h3>
        </div>
        <span className="text-xs text-white/30 font-mono">step {latest.step}</span>
      </div>

      {/* ── Context strip with inline candidates ── */}
      {contextWindow && (
        <div className="mb-4">
          <p className="text-xs text-white/30 mb-2">
            Context → competing predictions for the next token:
          </p>
          <div className="px-3 py-3 rounded-lg bg-white/[0.03] border border-white/10 font-mono text-sm leading-relaxed">
            {/* Context text */}
            <span className="text-white/40 break-all">{contextWindow}</span>
            {/* Cursor */}
            <span className="text-gold-light animate-pulse mx-0.5">|</span>
            {/* Inline candidate tokens */}
            <span className="inline-flex items-center gap-1 ml-1 flex-wrap">
              {top5.slice(0, 3).map((item, i) => {
                const pct = Math.round(item.prob * 100)
                const col = CANDIDATE_COLORS[i]
                return (
                  <motion.span
                    key={item.char + i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: i * 0.05 }}
                    className={`
                      inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs
                      ${col.bg} ${col.border} ${col.text}
                    `}
                    title={`${pct}% probability`}
                  >
                    <span>{displayChar(item.char)}</span>
                    <span className="opacity-60 text-[10px]">{pct}%</span>
                  </motion.span>
                )
              })}
            </span>
          </div>
          <p className="text-[10px] text-white/20 mt-1.5">
            First candidate is most likely. The model samples from this distribution — not always the top pick.
          </p>
        </div>
      )}

      {/* ── Full top-5 probability bars ── */}
      <div className="space-y-1.5 mb-4">
        <p className="text-xs text-white/30 mb-2">Full distribution — top 5 candidates:</p>
        <AnimatePresence mode="popLayout">
          {top5.map((item, i) => {
            const pct = Math.round(item.prob * 100)
            const isChosen = item.char === latest.generatedToken
            const col = CANDIDATE_COLORS[i]
            return (
              <motion.div
                key={item.char}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-2"
              >
                <span className={`
                  w-7 h-7 flex items-center justify-center text-sm font-mono rounded border shrink-0
                  ${isChosen
                    ? 'bg-gold-subtle text-gold-light border-gold-base'
                    : `${col.bg} ${col.text} ${col.border}`}
                `}>
                  {displayChar(item.char)}
                </span>

                <div className="flex-1 h-5 rounded bg-white/10 overflow-hidden relative">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: i === 0 ? 'linear-gradient(to right, #a78b71, #c9b8a0)' : undefined }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, 1)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {i > 0 && (
                      <div className="h-full w-full bg-white/10" />
                    )}
                  </motion.div>
                  <span className="absolute inset-0 flex items-center px-2 text-[11px] font-mono text-white/80">
                    {pct}%
                  </span>
                </div>

                {isChosen && (
                  <span className="text-[10px] text-gold-light shrink-0 font-medium">sampled</span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Temperature ── */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/40">Sampling Temperature (τ)</label>
          <span className="text-sm text-white/60 font-mono">{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.1} max={2.5} step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-gold-base [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-gold-light"
        />
        <div className="flex justify-between text-[10px] text-white/20 mt-1">
          <span>Focused (0.1)</span>
          <span>Balanced (1.0)</span>
          <span>Wild (2.5)</span>
        </div>
        <p className="text-xs text-white/30 mt-2 italic">{tempLabel}</p>
      </div>
    </div>
  )
}
