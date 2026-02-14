import { motion } from 'framer-motion'
import Heatmap2D from './Heatmap2D'

const CELLS = [
  { layer: 0, head: 0 },
  { layer: 0, head: 1 },
  { layer: 1, head: 0 },
  { layer: 1, head: 1 },
]

/**
 * 2×2 overview grid showing all 4 attention heads.
 * Clicking any cell enters Detail mode for that layer/head.
 */
export default function AttentionHeatmapGrid({ snapshots, currentStep, onSelectCell }) {
  function findSnapshot(layer, head) {
    const matching = snapshots.filter(s => s.layer === layer && s.head === head)
    if (!matching.length) return null
    if (currentStep == null) return matching[matching.length - 1]
    return matching.reduce((a, b) =>
      Math.abs(b.step - currentStep) < Math.abs(a.step - currentStep) ? b : a
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {CELLS.map(({ layer, head }) => {
        const snap = findSnapshot(layer, head)
        return (
          <motion.div
            key={`${layer}-${head}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCell(layer, head)}
            className="
              bg-neural-surface border border-neural-border rounded-lg p-3
              cursor-pointer hover:border-blue-500/50 transition-colors duration-150
            "
            title={`Click to view Layer ${layer}, Head ${head} in Detail Mode`}
          >
            <p className="text-xs text-slate-500 font-mono mb-2">
              Layer {layer}, Head {head}
            </p>
            {snap ? (
              <Heatmap2D matrix={snap.matrix} tokens={snap.tokens} size="small" />
            ) : (
              <div className="flex items-center justify-center h-20 text-slate-700 text-xs">
                waiting…
              </div>
            )}
          </motion.div>
        )
      })}
      <p className="col-span-2 text-center text-xs text-slate-600 mt-1">
        Click any heatmap to view in Detail Mode
      </p>
    </div>
  )
}
