import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Shows style evolution during training.
 * Can show overview (latest sample) or full evolution timeline.
 */
export default function StyleEvolutionDisplay({ text, samples, finalStats, showEvolution }) {
  // Compute style metrics for original text
  const originalMetrics = useMemo(() => {
    if (!text || text.trim().length === 0) return null

    const lower = text.toLowerCase()
    const words = lower.match(/[a-z]+/g) || []
    const totalW = words.length
    if (totalW === 0) return null

    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / totalW
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentLen = sentences.length > 0
      ? Math.round(sentences.reduce((s, sent) => s + (sent.trim().split(/\s+/).filter(Boolean).length), 0) / sentences.length)
      : 0

    return { avgWordLen, avgSentLen }
  }, [text])

  // Find first and last samples for comparison
  const { firstSample, lastSample, improvement } = useMemo(() => {
    if (!samples || samples.length === 0) {
      return { firstSample: null, lastSample: null, improvement: null }
    }

    const first = samples[0]
    const last = samples[samples.length - 1]

    // Calculate improvement
    let improvement = null
    if (first && last && originalMetrics) {
      const firstMatch = first.text?.toLowerCase().match(/[a-z]+/g) || []
      const lastMatch = last.text?.toLowerCase().match(/[a-z]+/g) || []
      const firstLen = firstMatch.reduce((s, w) => s + w.length, 0)
      const lastLen = lastMatch.reduce((s, w) => s + w.length, 0)
      const targetLen = text.match(/[a-z]+/g)?.reduce((s, w) => s + w.length, 0) || 0

      // How much closer are we to target length?
      const firstDiff = Math.abs(firstLen - targetLen) / Math.max(targetLen, 1)
      const lastDiff = Math.abs(lastLen - targetLen) / Math.max(targetLen, 1)

      improvement = firstDiff > 0 ? Math.round((firstDiff - lastDiff) / firstDiff * 100) : 0
    }

    return { firstSample: first, lastSample: last, improvement }
  }, [samples, text, originalMetrics])

  if (!text || text.trim().length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          {showEvolution ? 'Style Evolution' : 'Style Comparison'}
        </h3>
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-600 text-sm">
          <p>Paste your writing sample to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Original Text Analysis */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Your Writing Style
        </h3>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-300 italic mb-3">
            "{text.slice(0, 300)}{text.length > 300 ? '...' : ''}"
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Avg word length:</span>
              <span className="font-mono text-slate-300">{originalMetrics?.avgWordLen.toFixed(1)} chars</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Avg sentence length:</span>
              <span className="font-mono text-slate-300">{originalMetrics?.avgSentLen.toFixed(1)} words</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution View */}
      {showEvolution ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Style Learning Progress
          </h3>

          {samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-600 text-sm">
              <p>Start training to see how your style is learned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress indicator */}
              {samples.length > 0 && (
                <div className="px-4 py-3 rounded-md bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Training progress:</span>
                    <span className="font-mono text-cyan-400">
                      {samples.length} sample{samples.length !== 1 ? 's' : ''} generated
                    </span>
                  </div>
                  {improvement !== null && improvement >= 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Style match improvement:</span>
                        <span className={`font-mono ${improvement >= 50 ? 'text-green-400' : improvement >= 25 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {improvement}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {improvement >= 50 ? 'Excellent! Model has learned your style well.' :
                         improvement >= 25 ? 'Good progress. Model is catching patterns.' :
                         'Keep training. Model is still learning your style.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Timeline - Show all samples */}
              <div className="space-y-3">
                {samples.map((sample, idx) => {
                  const isEarly = idx < samples.length * 0.3
                  const isMiddle = idx >= samples.length * 0.3 && idx < samples.length * 0.7
                  const isLate = idx >= samples.length * 0.7

                  return (
                    <motion.div
                      key={sample.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="border border-slate-700 rounded-lg p-3 bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-mono">Step {sample.step}</span>
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${isEarly ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                             isMiddle ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                             'bg-green-500/20 text-green-400 border-green-500/30'}
                          `}>
                            {isEarly ? 'Early' : isMiddle ? 'Learning' : 'Mature'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {sample.text || 'Loading...'}
                      </p>

                      {sample.step === (samples[samples.length - 1]?.step) && finalStats && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-green-400">
                            <strong>Final Result:</strong> This represents the trained model's best imitation of your style.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Overview View - Side-by-side comparison */
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Final Comparison
          </h3>

          {!firstSample || !lastSample ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-600 text-sm">
              <p>Training in progress...</p>
              <p className="text-xs text-slate-500">Samples will appear here during training</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Your Writing
                </h4>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{text.slice(0, 200)}{text.length > 200 ? '…' : ''}"
                  </p>
                </div>
              </div>

              {/* Generated */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                  Model's Version
                </h4>
                <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-sm text-cyan-100 italic leading-relaxed">
                    {lastSample?.text || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confidence Metrics */}
          {finalStats && (
            <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">
                Training Metrics
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-xs">
                  <span className="text-slate-500">Final loss:</span>
                  <span className="font-mono text-slate-300">{finalStats.finalTrainLoss?.toFixed(4)}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Total time:</span>
                  <span className="font-mono text-slate-300">{finalStats.totalTime?.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
