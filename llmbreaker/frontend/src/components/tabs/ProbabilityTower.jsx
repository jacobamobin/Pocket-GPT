import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InfoIcon from '../shared/InfoIcon'

/**
 * Probability Tower — shows top-5 next-token predictions with a temperature slider.
 *
 * Receives raw logits from the backend and applies temperature client-side
 * so the slider is instantaneous.
 */

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
  if (ch === '\r') return '⏎'
  return ch
}

const BAR_COLORS = [
  'from-blue-500 to-cyan-400',
  'from-blue-600 to-blue-400',
  'from-slate-500 to-slate-400',
  'from-slate-600 to-slate-400',
  'from-slate-700 to-slate-500',
]

export default function ProbabilityTower({ tokenProbabilities = [], samples = [] }) {
  const [temperature, setTemperature] = useState(0.8)

  // Use the most recent probability snapshot
  const latest = tokenProbabilities.length > 0
    ? tokenProbabilities[tokenProbabilities.length - 1]
    : null

  // Compute top-5 probabilities with current temperature
  const top5 = useMemo(() => {
    if (!latest) return []
    const { logits, vocab } = latest
    const probs = softmax(logits, temperature)

    // Build (char, prob) pairs and sort
    const pairs = probs.map((p, i) => ({
      char: vocab[i] ?? '?',
      prob: p,
      idx: i,
    }))
    pairs.sort((a, b) => b.prob - a.prob)
    return pairs.slice(0, 5)
  }, [latest, temperature])

  // Find the matching generated text for the latest step
  const generatedText = useMemo(() => {
    if (!latest || !samples.length) return ''
    const match = samples.find(s => s.step === latest.step)
    return match?.text ?? ''
  }, [latest, samples])

  // Temperature description
  const tempLabel = useMemo(() => {
    if (temperature < 0.3)  return 'Very focused — always picks the top choice'
    if (temperature < 0.7)  return 'Focused — mostly picks likely characters'
    if (temperature < 1.1)  return 'Balanced — good mix of predictability and variety'
    if (temperature < 1.8)  return 'Creative — more random, unexpected choices'
    return 'Wild — nearly random, causes "hallucinations"'
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Next-Token Prediction
          </h3>
          <InfoIcon topicId="text-progression" />
          <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>
        </div>
      </div>

      {/* Show what the model is "thinking" */}
      {generatedText && (
        <div className="mb-3 px-3 py-2 rounded-md bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Generated so far:</p>
          <p className="text-xs font-mono text-slate-400 break-all">
            {generatedText.slice(-60)}
            <span className="text-blue-400 animate-pulse">|</span>
          </p>
        </div>
      )}

      {/* Top-5 bar chart */}
      <div className="space-y-1.5 mb-4">
        <p className="text-xs text-slate-500 mb-2">
          What the model almost picked for the last character:
        </p>
        <AnimatePresence mode="popLayout">
          {top5.map((item, i) => {
            const pct = Math.round(item.prob * 100)
            const isChosen = item.char === latest.generatedToken
            return (
              <motion.div
                key={item.char}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-2"
              >
                {/* Character label */}
                <span className={`
                  w-8 text-center text-sm font-mono rounded px-1 py-0.5
                  ${isChosen
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-neural-surface text-slate-400 border border-neural-border'}
                `}>
                  {displayChar(item.char)}
                </span>

                {/* Bar */}
                <div className="flex-1 h-6 rounded-md bg-neural-border overflow-hidden relative">
                  <motion.div
                    className={`h-full rounded-md bg-gradient-to-r ${BAR_COLORS[i]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, 1)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-mono text-white mix-blend-difference">
                    {pct}%
                  </span>
                </div>

                {/* Chosen indicator */}
                {isChosen && (
                  <span className="text-xs text-blue-400 shrink-0">chosen</span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Temperature slider */}
      <div className="border-t border-neural-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
            Temperature
          </label>
          <span className="text-sm text-slate-300 font-mono">{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={2.5}
          step={0.1}
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
        <p className="text-xs text-slate-500 mt-2 italic">
          {tempLabel}
        </p>
      </div>
    </div>
  )
}
