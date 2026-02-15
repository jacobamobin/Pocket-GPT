import { useState } from 'react'
import { motion } from 'framer-motion'

// ── Helper components ────────────────────────────────────────────────────────

function GroupSection({ title, subtitle, open, onToggle, children }) {
  return (
    <div className="mb-3 border border-neural-border/50 rounded-md overflow-hidden">
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        className="flex items-center justify-between px-3 py-2 bg-neural-surface/80 cursor-pointer hover:bg-neural-border/30 transition-colors"
      >
        <div>
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</span>
          <span className="ml-2 text-xs text-white/30">{subtitle}</span>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="w-3 h-3 text-white/30 flex-shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>
      {open && (
        <div className="px-3 py-3 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

function ConfigRow({ label, sublabel, children }) {
  return (
    <div>
      <div className="mb-1">
        <span className="text-xs font-medium text-white/40">{label}</span>
        {sublabel && <p className="text-xs text-white/20 mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </div>
  )
}

function PillGroup({ options, value, onChange, disabled }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          title={opt.desc}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium border
            transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            ${String(value) === String(opt.value)
              ? 'border-gold-base text-gold-light bg-gold-base/10'
              : 'border-neural-border text-white/40 bg-neural-surface hover:text-white hover:border-gold-base/50'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SliderWithValue({ min, max, step, value, onChange, format, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1 h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                   disabled:opacity-40 disabled:cursor-not-allowed
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                   [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold-base [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:hover:bg-gold-light"
      />
      <span className="text-sm text-white/60 font-mono w-16 text-right flex-shrink-0">
        {format ? format(value) : value}
      </span>
    </div>
  )
}

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!value)}
      disabled={disabled}
      aria-pressed={value}
      className={`
        relative w-10 h-5 rounded-full transition-colors duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${value ? 'bg-gold-base' : 'bg-neural-border'}
      `}
    >
      <span className={`
        absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
        transition-transform duration-200
        ${value ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function TrainingConfigPanel({
  maxIters = 5000,
  evalInterval = 100,
  modelSize = 'medium',
  onMaxItersChange,
  onEvalIntervalChange,
  onModelSizeChange,
  disabled = false,
  isTraining = false,
  learningRate = 'balanced',
  batchSize = 'medium',
  blockSize = 128,
  dropout = 0.0,
  warmup = true,
  temperature = 0.8,
  onLearningRateChange,
  onBatchSizeChange,
  onBlockSizeChange,
  onDropoutChange,
  onWarmupChange,
  onTemperatureChange,
  drawerMode = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openGroups, setOpenGroups] = useState({ brain: true, learn: true, generate: true })
  const toggleGroup = (g) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }))

  const modelSizes = {
    small: {
      label: 'Small',
      description: 'Fast (~15K params)',
      config: { n_embd: 32, n_layer: 3, n_head: 4, block_size: 96 },
      recommendedSteps: 3000,
    },
    medium: {
      label: 'Medium',
      description: 'Balanced (~80K params)',
      config: { n_embd: 64, n_layer: 4, n_head: 4, block_size: 128 },
      recommendedSteps: 5000,
    },
    large: {
      label: 'Large',
      description: 'Best (~250K params)',
      config: { n_embd: 96, n_layer: 6, n_head: 6, block_size: 256 },
      recommendedSteps: 8000,
    },
  }

  const blockSizeOptions = [
    { value: 64,  label: '64',  desc: 'Shortest memory' },
    { value: 128, label: '128', desc: 'Standard' },
    { value: 256, label: '256', desc: 'Long memory' },
  ]

  const handleModelSizeChange = (size) => {
    if (!disabled && !isTraining) {
      onModelSizeChange?.(size)
      onMaxItersChange?.(modelSizes[size].recommendedSteps)
    }
  }

  const isLocked = disabled || isTraining

  const content = (
    <div className={drawerMode ? 'space-y-0' : 'px-4 py-4 border-t border-neural-border bg-neural-surface/50'}>
          {/* ── Group 1: Model Brain ── */}
          <GroupSection
            title="Model Brain"
            subtitle="Size and memory of the network"
            open={openGroups.brain}
            onToggle={() => toggleGroup('brain')}
          >
            <ConfigRow
              label="Architecture (n_embd / n_layer / n_head)"
              sublabel="Sets embedding dim, depth, and attention heads. More params → lower loss ceiling, slower wall-clock per step."
            >
              <PillGroup
                options={Object.entries(modelSizes).map(([k, v]) => ({ value: k, label: v.label, desc: v.description }))}
                value={modelSize}
                onChange={handleModelSizeChange}
                disabled={isLocked}
              />
              <p className="text-xs text-white/30 mt-1">
                {modelSizes[modelSize].description}
              </p>
            </ConfigRow>

            <ConfigRow
              label="Context Window (block_size)"
              sublabel="Max sequence length for causal self-attention. Quadratic memory cost — doubling block_size 4× the attention matrix."
            >
              <PillGroup
                options={blockSizeOptions}
                value={blockSize}
                onChange={(v) => onBlockSizeChange?.(Number(v))}
                disabled={isLocked}
              />
            </ConfigRow>

            <ConfigRow
              label="Dropout (p)"
              sublabel="Bernoulli noise applied to activations during forward pass. Regularises the network — reduces co-adaptation of neurons. Not used at inference."
            >
              <SliderWithValue
                min={0} max={0.5} step={0.05}
                value={dropout}
                onChange={(v) => onDropoutChange?.(v)}
                format={(v) => v.toFixed(2)}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>0.00 Off</span><span>0.50 Heavy</span>
              </div>
            </ConfigRow>
          </GroupSection>

          {/* ── Group 2: How It Learns ── */}
          <GroupSection
            title="How It Learns"
            subtitle="Optimizer and training schedule"
            open={openGroups.learn}
            onToggle={() => toggleGroup('learn')}
          >
            <ConfigRow
              label="Peak Learning Rate (η)"
              sublabel="Step size for AdamW gradient descent. Too high → loss spikes / divergence. Too low → underfitting within budget. Cosine-decays to η/10 over training."
            >
              <PillGroup
                options={[
                  { value: 'slow',     label: 'Slow',     desc: '0.0001 — very stable' },
                  { value: 'balanced', label: 'Balanced', desc: '0.001 — recommended' },
                  { value: 'fast',     label: 'Fast',     desc: '0.003 — risky' },
                ]}
                value={learningRate}
                onChange={onLearningRateChange}
                disabled={isLocked}
              />
            </ConfigRow>

            <ConfigRow
              label="Batch Size (B)"
              sublabel="Number of sequences per gradient update. Larger B → lower gradient variance, but linear memory cost. Effective LR often scales with B."
            >
              <PillGroup
                options={[
                  { value: 'small',  label: 'Small',  desc: '16 chunks' },
                  { value: 'medium', label: 'Medium', desc: '32 chunks' },
                  { value: 'large',  label: 'Large',  desc: '64 chunks' },
                ]}
                value={batchSize}
                onChange={onBatchSizeChange}
                disabled={isLocked}
              />
            </ConfigRow>

            <ConfigRow
              label="Training Steps (T)"
              sublabel="Total gradient updates. Loss typically follows a power-law decay — early steps compress the most information, diminishing returns after convergence."
            >
              <SliderWithValue
                min={500} max={15000} step={500}
                value={maxIters}
                onChange={onMaxItersChange}
                format={(v) => v.toLocaleString()}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>500</span><span>15,000</span>
              </div>
              <p className="text-xs text-white/30 mt-1">
                Recommended: {modelSizes[modelSize].recommendedSteps.toLocaleString()}+ for {modelSizes[modelSize].label} model
              </p>
            </ConfigRow>

            <ConfigRow
              label="LR Warmup (100 steps)"
              sublabel="Linear ramp from 0 → η over the first 100 steps. Prevents large gradient updates before embeddings are initialised, stabilises early loss."
            >
              <Toggle value={warmup} onChange={onWarmupChange} disabled={isLocked} />
            </ConfigRow>
          </GroupSection>

          {/* ── Group 3: Generation ── */}
          <GroupSection
            title="Generation"
            subtitle="Controls how the model generates text samples"
            open={openGroups.generate}
            onToggle={() => toggleGroup('generate')}
          >
            <ConfigRow
              label="Sampling Temperature (τ)"
              sublabel="Scales logits before softmax: p(x) ∝ exp(logit/τ). τ&lt;1 sharpens the distribution (greedy-ish), τ&gt;1 flattens it (high entropy)."
            >
              <SliderWithValue
                min={0.3} max={1.5} step={0.1}
                value={temperature}
                onChange={(v) => onTemperatureChange?.(v)}
                format={(v) => v.toFixed(1)}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>0.3 Focused</span><span>1.5 Wild</span>
              </div>
            </ConfigRow>

            <ConfigRow
              label="Eval Interval (steps)"
              sublabel="How often to run the validation loop and emit metrics. More frequent = smoother loss curve but adds ~2% overhead per eval."
            >
              <SliderWithValue
                min={25} max={200} step={25}
                value={evalInterval}
                onChange={onEvalIntervalChange}
                format={(v) => `every ${v}`}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>25</span><span>200</span>
              </div>
            </ConfigRow>
          </GroupSection>
    </div>
  )

  return drawerMode ? content : (
    <div className="border border-neural-border rounded-lg overflow-hidden">
      <div
        onClick={() => !isTraining && setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={isTraining ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !isTraining && setIsExpanded(!isExpanded)}
        className={`
          w-full px-4 py-3 flex items-center justify-between
          bg-neural-surface hover:bg-neural-border/50
          transition-colors duration-150 cursor-pointer
          ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="text-sm font-medium text-white/60">Training Configuration</span>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-white/40"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>
      {isExpanded && content}
    </div>
  )
}
