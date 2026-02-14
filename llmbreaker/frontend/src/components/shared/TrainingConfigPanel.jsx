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
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
          <span className="ml-2 text-xs text-slate-500">{subtitle}</span>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="w-3 h-3 text-slate-500 flex-shrink-0"
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
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {sublabel && <p className="text-xs text-slate-600 mt-0.5">{sublabel}</p>}
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
              ? 'border-blue-500 text-blue-300 bg-blue-500/10'
              : 'border-neural-border text-slate-400 bg-neural-surface hover:text-white hover:border-blue-500/50'
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
                   [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:hover:bg-blue-400"
      />
      <span className="text-sm text-slate-300 font-mono w-16 text-right flex-shrink-0">
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
        ${value ? 'bg-blue-500' : 'bg-neural-border'}
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
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openGroups, setOpenGroups] = useState({ brain: true, learn: true, generate: true })
  const toggleGroup = (g) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }))

  const modelSizes = {
    small: {
      label: 'Small',
      description: 'Fast (~15K params)',
      config: { n_embd: 32, n_layer: 3, n_head: 3, block_size: 96 },
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

  return (
    <div className="border border-neural-border rounded-lg overflow-hidden">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-slate-300">Training Configuration</span>
        </div>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-4 border-t border-neural-border bg-neural-surface/50"
        >
          {/* ── Group 1: Model Brain ── */}
          <GroupSection
            title="Model Brain"
            subtitle="Size and memory of the network"
            open={openGroups.brain}
            onToggle={() => toggleGroup('brain')}
          >
            <ConfigRow
              label="Brain Size"
              sublabel="More neurons = smarter but slower to train"
            >
              <PillGroup
                options={Object.entries(modelSizes).map(([k, v]) => ({ value: k, label: v.label, desc: v.description }))}
                value={modelSize}
                onChange={handleModelSizeChange}
                disabled={isLocked}
              />
              <p className="text-xs text-slate-500 mt-1">
                {modelSizes[modelSize].description}
              </p>
            </ConfigRow>

            <ConfigRow
              label="Memory Span"
              sublabel="How many characters the model can see at once when predicting the next one"
            >
              <PillGroup
                options={blockSizeOptions}
                value={blockSize}
                onChange={(v) => onBlockSizeChange?.(Number(v))}
                disabled={isLocked}
              />
            </ConfigRow>

            <ConfigRow
              label="Dropout"
              sublabel="Randomly ignores neurons during training — prevents memorizing, improves generalizing"
            >
              <SliderWithValue
                min={0} max={0.5} step={0.05}
                value={dropout}
                onChange={(v) => onDropoutChange?.(v)}
                format={(v) => v.toFixed(2)}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
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
              label="Learning Rate"
              sublabel="How big each update step is — too fast = unstable, too slow = takes forever"
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
              label="Batch Size"
              sublabel="How many text chunks it learns from at once — bigger = more stable but uses more memory"
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
              label="Training Steps"
              sublabel="More steps = better model, but takes longer"
            >
              <SliderWithValue
                min={500} max={15000} step={500}
                value={maxIters}
                onChange={onMaxItersChange}
                format={(v) => v.toLocaleString()}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>500</span><span>15,000</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recommended: {modelSizes[modelSize].recommendedSteps.toLocaleString()}+ for {modelSizes[modelSize].label} model
              </p>
            </ConfigRow>

            <ConfigRow
              label="Learning Rate Warmup"
              sublabel="Starts with tiny steps to stabilize early training, then ramps up"
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
              label="Temperature"
              sublabel="Lower = predictable and repetitive. Higher = creative and chaotic."
            >
              <SliderWithValue
                min={0.3} max={1.5} step={0.1}
                value={temperature}
                onChange={(v) => onTemperatureChange?.(v)}
                format={(v) => v.toFixed(1)}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0.3 Focused</span><span>1.5 Wild</span>
              </div>
            </ConfigRow>

            <ConfigRow
              label="Update Frequency"
              sublabel="How often to refresh charts and generate text samples (in steps)"
            >
              <SliderWithValue
                min={25} max={200} step={25}
                value={evalInterval}
                onChange={onEvalIntervalChange}
                format={(v) => `every ${v}`}
                disabled={isLocked}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>25</span><span>200</span>
              </div>
            </ConfigRow>
          </GroupSection>
        </motion.div>
      )}
    </div>
  )
}
