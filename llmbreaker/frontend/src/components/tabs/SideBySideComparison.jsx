import { useMemo } from 'react'

// ── Style metrics (computed from text) ────────────────────────────────────────

const FORMAL_WORDS   = new Set(['regarding','pursuant','aforementioned','nevertheless','therefore',
  'furthermore','additionally','consequently','subsequently','hereby','henceforth',
  'accordingly','herein','whereas','notwithstanding','sincerely','respectfully',
  'kindly','professionally','formally','hereto','therein','whilst'])

const INFORMAL_WORDS = new Set(['gonna','wanna','yeah','stuff','things','like','just',
  'really','pretty','kinda','sorta','gotta','lol','btw','omg','nope','yep','ok',
  'okay','hey','cool','awesome','literally','basically','totally','honestly'])

function computeStyleMetrics(text) {
  if (!text || text.trim().length === 0) return null
  const lower    = text.toLowerCase()
  const words    = lower.match(/[a-z']+/g) || []
  const totalW   = words.length
  if (totalW === 0) return null

  const formalCount   = words.filter(w => FORMAL_WORDS.has(w)).length
  const informalCount = words.filter(w => INFORMAL_WORDS.has(w)).length
  const formality     = Math.max(0, Math.min(100, 50 + (formalCount - informalCount) * 10))

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentLen = sentences.length > 0
    ? Math.round(sentences.reduce((s, sent) => s + (sent.trim().split(/\s+/).filter(Boolean).length), 0) / sentences.length)
    : 0

  const uniqueW    = new Set(words).size
  const vocabRich  = totalW > 0 ? (uniqueW / totalW) : 0

  return { formality, avgSentLen, vocabRich }
}

function formalityLabel(score) {
  if (score >= 75) return 'High'
  if (score >= 45) return 'Medium'
  return 'Low'
}

// ── Phrase highlighting ───────────────────────────────────────────────────────

function findCommonBigrams(text1, text2) {
  const words1  = (text1.toLowerCase().match(/[a-z']+/g) || [])
  const lower2  = text2.toLowerCase()
  const phrases = new Set()

  for (let i = 0; i < words1.length - 1; i++) {
    const bigram = words1[i] + ' ' + words1[i + 1]
    if (bigram.length > 4 && lower2.includes(bigram)) {
      phrases.add(bigram)
    }
  }
  return phrases
}

function HighlightedText({ text, phrases }) {
  if (!phrases || phrases.size === 0) return <span>{text}</span>

  const lower   = text.toLowerCase()
  const ranges  = []
  for (const phrase of phrases) {
    let idx = lower.indexOf(phrase)
    while (idx !== -1) {
      ranges.push([idx, idx + phrase.length])
      idx = lower.indexOf(phrase, idx + 1)
    }
  }

  ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const [s, e] of ranges) {
    if (merged.length && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e)
    } else {
      merged.push([s, e])
    }
  }

  const parts = []
  let pos = 0
  for (const [s, e] of merged) {
    if (pos < s) parts.push({ t: text.slice(pos, s), h: false })
    parts.push({ t: text.slice(s, e), h: true })
    pos = e
  }
  if (pos < text.length) parts.push({ t: text.slice(pos), h: false })

  return (
    <>
      {parts.map((p, i) =>
        p.h
          ? <mark key={i} className="bg-gold-base/25 text-gold-light rounded-sm">{p.t}</mark>
          : <span key={i}>{p.t}</span>
      )}
    </>
  )
}

// ── Confidence metrics (from training loss) ───────────────────────────────────

function computeConfidenceMetrics(finalStats) {
  if (!finalStats) return null
  const loss    = finalStats.finalTrainLoss ?? 4.5
  const perp    = Math.exp(loss)
  const avgProb = Math.exp(-loss)
  const confPct = Math.max(0, Math.min(100, Math.round((1 - loss / 4.5) * 100)))
  return { confPct, avgProb, perp }
}

// ── Metric display row ────────────────────────────────────────────────────────

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-neural-border/40 last:border-0">
      <span className="text-xs text-white/30">{label}</span>
      <span className="text-xs text-gold-light font-mono">{value}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Side-by-side comparison of original text vs generated text with style metrics.
 *
 * @param {object} props
 * @param {string}   props.originalText  - user's input text
 * @param {object[]} props.samples       - generated samples from training
 * @param {object}   props.finalStats    - {finalTrainLoss, finalValLoss, totalTime}
 */
export default function SideBySideComparison({ originalText, samples, finalStats }) {
  const latestSample  = samples.length > 0 ? samples[samples.length - 1] : null
  const generatedText = latestSample?.text ?? ''

  const styleMetrics = useMemo(() => computeStyleMetrics(originalText), [originalText])
  const confMetrics  = useMemo(() => computeConfidenceMetrics(finalStats), [finalStats])
  const phrases      = useMemo(
    () => (originalText && generatedText) ? findCommonBigrams(originalText, generatedText) : new Set(),
    [originalText, generatedText]
  )

  const origExcerpt = originalText.slice(0, 400)
  const genExcerpt  = generatedText.slice(0, 400)

  return (
    <div className="card flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
        Style Comparison
        {phrases.size > 0 && (
          <span className="ml-3 text-xs text-gold-light font-normal normal-case">
            {phrases.size} shared phrase{phrases.size !== 1 ? 's' : ''} highlighted
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Left: Original ── */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wide">
            Original Text
          </h4>
          <div className="
            bg-neural-bg border border-neural-border rounded-lg p-3
            text-xs text-white/60 font-mono leading-relaxed min-h-[120px]
            overflow-y-auto max-h-48
          ">
            <HighlightedText text={origExcerpt} phrases={phrases} />
            {originalText.length > 400 && (
              <span className="text-white/20"> …({(originalText.length - 400).toLocaleString()} more chars)</span>
            )}
          </div>

          {/* Style metrics */}
          {styleMetrics && (
            <div className="bg-neural-surface border border-neural-border rounded-lg px-3 py-2">
              <p className="text-xs text-white/30 uppercase tracking-wide mb-1.5 font-semibold">
                Style Metrics
              </p>
              <MetricRow
                label="Formality"
                value={`${formalityLabel(styleMetrics.formality)} (${styleMetrics.formality})`}
              />
              <MetricRow
                label="Avg Sentence"
                value={`${styleMetrics.avgSentLen} words`}
              />
              <MetricRow
                label="Vocab Richness"
                value={styleMetrics.vocabRich.toFixed(2)}
              />
            </div>
          )}
        </div>

        {/* ── Right: Generated ── */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wide">
            Generated (Your Style)
          </h4>
          <div className="
            bg-neural-bg border border-neural-border rounded-lg p-3
            text-xs text-white/60 font-mono leading-relaxed min-h-[120px]
            overflow-y-auto max-h-48
          ">
            {genExcerpt
              ? <HighlightedText text={genExcerpt} phrases={phrases} />
              : <span className="text-white/20">Generated text will appear here during training…</span>
            }
          </div>

          {/* Confidence metrics */}
          {confMetrics && (
            <div className="bg-neural-surface border border-neural-border rounded-lg px-3 py-2">
              <p className="text-xs text-white/30 uppercase tracking-wide mb-1.5 font-semibold">
                Confidence Metrics
              </p>
              <MetricRow
                label="Confidence"
                value={`${confMetrics.confPct}%`}
              />
              <MetricRow
                label="Avg Token Prob"
                value={confMetrics.avgProb.toFixed(2)}
              />
              <MetricRow
                label="Perplexity"
                value={confMetrics.perp.toFixed(1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
