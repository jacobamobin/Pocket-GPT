import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Heatmap2D from './Heatmap2D'

/**
 * Shows attention evolution: early training vs late training side-by-side.
 * Makes it easy to see how attention patterns become structured.
 */
export default function AttentionEvolutionDisplay({ snapshots, layer, head }) {
  // Find early and late snapshots for this layer/head
  const { early, late } = useMemo(() => {
    const matching = snapshots.filter(s => s.layer === layer && s.head === head).sort((a, b) => a.step - b.step)
    if (matching.length < 2) {
      return { early: null, late: null }
    }
    return {
      early: matching[0],           // First snapshot
      late: matching[matching.length - 1],  // Last snapshot
    }
  }, [snapshots, layer, head])

  if (!early || !late) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Attention Evolution
        </h3>
        <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm gap-2">
          <p>Need at least 2 checkpoints to show evolution</p>
          <p className="text-xs text-slate-500">
            Keep training or wait for more snapshots
          </p>
        </div>
      </div>
    )
  }

  const improvementPercent = early.step > 0
    ? Math.round(((late.step - early.step) / late.step) * 100)
    : 0

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Attention Evolution — Layer {layer}, Head {head}
      </h3>

      {/* Progress indicator */}
      <div className="mb-4 px-3 py-2 rounded-md bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Training progress:</span>
          <span className="font-mono text-cyan-400">
            Step {early.step} → {late.step}
            <span className="text-slate-500 ml-2">(+{late.step - early.step} steps)</span>
          </span>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* Early training */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Early Training
            </h4>
            <span className="text-xs text-slate-500 font-mono">Step {early.step}</span>
          </div>
          <div className="rounded-lg border border-slate-700 p-2 bg-slate-800/30">
            <Heatmap2D matrix={early.matrix} tokens={early.tokens} size="medium" />
          </div>
          <p className="text-xs text-slate-500 italic">
            {improvementPercent < 25
              ? 'Random/unfocused - model hasn\'t learned patterns yet'
              : 'Starting to show some structure but still noisy'}
          </p>
        </div>

        {/* Late training */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Current
            </h4>
            <span className="text-xs text-slate-500 font-mono">Step {late.step}</span>
          </div>
          <div className="rounded-lg border border-cyan-500/30 p-2 bg-cyan-950/20">
            <Heatmap2D matrix={late.matrix} tokens={late.tokens} size="medium" />
          </div>
          <p className="text-xs text-cyan-400 italic">
            {improvementPercent >= 75
              ? 'Well-structured attention - model has learned meaningful patterns'
              : improvementPercent >= 50
              ? 'Much more organized - attention is becoming specialized'
              : 'Still learning - patterns are getting clearer'}
          </p>
        </div>
      </div>

      {/* Key insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 px-4 py-3 rounded-md bg-blue-950/30 border border-blue-500/30"
      >
        <p className="text-xs text-blue-300">
          <strong className="text-blue-200">Key Insight:</strong> Watch how attention becomes more diagonal and focused during training.
          Well-trained attention heads focus on relevant token relationships, not random noise.
        </p>
      </motion.div>
    </div>
  )
}
