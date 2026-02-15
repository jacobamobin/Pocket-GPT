import { motion, AnimatePresence } from 'framer-motion'
import Heatmap2D from './Heatmap2D'
import InfoIcon from '../shared/InfoIcon'

/**
 * Dynamic grid showing ALL attention heads simultaneously.
 * Adapts to model size (2-6 layers, 2-6 heads).
 */
export default function AttentionHeatmapGrid({ snapshots, currentStep, onSelectCell, modelConfig }) {
  // Get model dimensions from config or derive from snapshots
  const nLayers = modelConfig?.n_layer || 4
  const nHeads = modelConfig?.n_head || 4

  // Generate all possible layer/head combinations
  const allCells = []
  for (let layer = 0; layer < nLayers; layer++) {
    for (let head = 0; head < nHeads; head++) {
      allCells.push({ layer, head })
    }
  }

  function findSnapshot(layer, head) {
    const matching = snapshots.filter(s => s.layer === layer && s.head === head)
    if (!matching.length) return null
    if (currentStep == null) return matching[matching.length - 1]
    return matching.reduce((a, b) =>
      Math.abs(b.step - currentStep) < Math.abs(a.step - currentStep) ? b : a
    )
  }

  return (
    <div className="space-y-4">
      {/* Educational header */}
      <div className="px-4 py-3 rounded-md bg-white/[0.05]/50 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-white/40">
            <strong className="text-white/60">What you're seeing:</strong> Attention patterns show which tokens each head focuses on when generating text.</p>
          <InfoIcon topicId="attention-heatmap" />
        </div>
        <p className="text-xs text-white/40">
          Watch how patterns become more structured during training.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gold-base" />
            <span className="text-white/40">High attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white/[0.05]" />
            <span className="text-white/40">Low attention</span>
          </div>
        </div>
      </div>

      {/* Dynamic grid based on model size */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(nHeads, 4)}, minmax(0, 1fr))`
        }}
      >
        {allCells.map(({ layer, head }) => {
          const snap = findSnapshot(layer, head)
          return (
            <motion.div
              key={`${layer}-${head}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCell(layer, head)}
              className="
                bg-neural-surface border border-neural-border rounded-lg p-2
                cursor-pointer hover:border-gold-base/50 transition-colors duration-150
              "
              title={`Click to view Layer ${layer}, Head ${head} in Detail Mode`}
            >
              <p className="text-xs text-white/30 font-mono mb-2">
                L{layer} H{head}
              </p>
              {snap ? (
                <Heatmap2D matrix={snap.matrix} tokens={snap.tokens} size="small" />
              ) : (
                <div className="flex items-center justify-center h-16 text-white/15 text-xs">
                  {snapshots.length === 0 ? 'Start training' : 'Waiting…'}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Learning insights */}
      {snapshots.length > 0 && (
        <div className="px-4 py-2 rounded-md bg-cyan-950/30 border border-gold-base/30">
          <p className="text-xs text-gold-light">
            {(() => {
              const step = currentStep ?? snapshots[snapshots.length - 1]?.step ?? 0
              if (step < 500) return 'Early training: Attention is mostly random. Keep watching!'
              if (step < 2000) return 'Learning phase: Patterns are starting to emerge.'
              return 'Maturing: Attention patterns are becoming specialized and structured.'
            })()}
          </p>
        </div>
      )}
    </div>
  )
}
