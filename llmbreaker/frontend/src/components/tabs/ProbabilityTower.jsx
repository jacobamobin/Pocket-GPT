import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InfoIcon from '../shared/InfoIcon'

function softmax(logits, temperature) {
  const t = Math.max(temperature, 0.01)
  const scaled = logits.map(l => l / t)
  const maxVal = Math.max(...scaled)
  const exps = scaled.map(l => Math.exp(l - maxVal))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

function displayChar(ch) {
  if (ch === ' ')  return '␣'
  if (ch === '\n') return '↵'
  if (ch === '\t') return '⇥'
  return ch
}

const CANDIDATE_COLORS = [
  { bg: 'bg-blue-500/20',   border: 'border-blue-400/60',   text: 'text-blue-300'   },
  { bg: 'bg-cyan-500/15',   border: 'border-cyan-400/50',   text: 'text-cyan-300'   },
  { bg: 'bg-slate-500/15',  border: 'border-slate-400/40',  text: 'text-slate-300'  },
  { bg: 'bg-slate-600/10',  border: 'border-slate-500/30',  text: 'text-slate-400'  },
  { bg: 'bg-slate-700/10',  border: 'border-slate-600/20',  text: 'text-slate-500'  },
]

export default function ProbabilityTower({ tokenProbabilities = [], samples = [] }) {
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
    if (temperature < 0.3)  return 'Near-greedy — nearly always picks the argmax token'
    if (temperature < 0.7)  return 'Low entropy — distribution is sharply peaked'
    if (temperature < 1.1)  return 'Balanced — moderate entropy, mix of likely and unlikely tokens'
    if (temperature < 1.8)  return 'High entropy — distribution is flattened, more stochasticity'
    return 'Near-uniform — logits are heavily smoothed, near-random sampling'
  }, [temperature])

  if (!latest) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Next-Token Prediction
          </h3>
          <InfoIcon topicId="text-progression" />
        </div>
        <div className="flex items-center justify-center h-28 text-slate-600 text-sm">
          Predictions will appear during training
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Next-Token Prediction
          </h3>
          <InfoIcon topicId="text-progression" />
        </div>
        <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>
      </div>

      {/* ── Context strip with inline candidates ── */}
      {contextWindow && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">
            Context → competing predictions for the next token:
          </p>
          <div className="px-3 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 font-mono text-sm leading-relaxed">
            {/* Context text */}
            <span className="text-slate-400 break-all">{contextWindow}</span>
            {/* Cursor */}
            <span className="text-blue-400 animate-pulse mx-0.5">|</span>
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
          <p className="text-[10px] text-slate-600 mt-1.5">
            First candidate is most likely. The model samples from this distribution — not always the top pick.
          </p>
        </div>
      )}

      {/* ── Full top-5 probability bars ── */}
      <div className="space-y-1.5 mb-4">
        <p className="text-xs text-slate-500 mb-2">Full distribution — top 5 candidates:</p>
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
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : `${col.bg} ${col.text} ${col.border}`}
                `}>
                  {displayChar(item.char)}
                </span>

                <div className="flex-1 h-5 rounded bg-neural-border overflow-hidden relative">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: i === 0 ? 'linear-gradient(to right, #3b82f6, #22d3ee)' : undefined }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, 1)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {i > 0 && (
                      <div className="h-full w-full bg-slate-600/50" />
                    )}
                  </motion.div>
                  <span className="absolute inset-0 flex items-center px-2 text-[11px] font-mono text-white/80">
                    {pct}%
                  </span>
                </div>

                {isChosen && (
                  <span className="text-[10px] text-blue-400 shrink-0 font-medium">sampled</span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Temperature ── */}
      <div className="border-t border-neural-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Sampling Temperature (τ)</label>
          <span className="text-sm text-slate-300 font-mono">{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.1} max={2.5} step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-blue-400"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>Focused (0.1)</span>
          <span>Balanced (1.0)</span>
          <span>Wild (2.5)</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">{tempLabel}</p>
      </div>
    </div>
  )
}
