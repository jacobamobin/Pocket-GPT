import { motion } from 'framer-motion'
import { useGeneration } from '../../contexts/GenerationContext'

function escapeToken(token) {
  if (token === ' ') return '(space)'
  if (token === '\n') return '\\n'
  if (token === '\t') return '\\t'
  if (token === '\r') return '\\r'
  return token
}

export default function ProbabilityBars() {
  const { currentProbabilities, highlightedIndex, actions } = useGeneration()

  if (!currentProbabilities || currentProbabilities.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
        Next Token Probabilities
      </p>
      <div className="space-y-1">
        {currentProbabilities.slice(0, 10).map((item, index) => {
          const isHighlighted = index === highlightedIndex
          const pct = (item.prob * 100).toFixed(1)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isHighlighted
                  ? 'bg-gold-subtle border border-gold-muted'
                  : 'border border-transparent hover:bg-white/[0.03]'
                }`}
              onClick={() => actions.setHighlightedIndex(index)}
            >
              <span className="w-3 text-gold-light text-xs shrink-0">
                {isHighlighted ? '→' : ''}
              </span>

              <span className="w-16 font-mono text-sm text-white/60 shrink-0 truncate">
                {escapeToken(item.token)}
              </span>

              <div className="flex-1 h-4 bg-white/10 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`h-full ${isHighlighted ? 'bg-gold-base' : 'bg-gold-muted'}`}
                />
              </div>

              <span className="w-10 text-right text-xs text-white/40 shrink-0">
                {pct}%
              </span>
            </motion.div>
          )
        })}
      </div>
      <p className="text-xs text-white/20">↑↓ navigate · Enter or Step to accept</p>
    </div>
  )
}
