import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * TrainingConfigPanel — Collapsible panel for configuring training parameters.
 *
 * @param {Object} props
 * @param {number} props.maxIters - Current max iterations
 * @param {number} props.evalInterval - Current evaluation interval
 * @param {string} props.modelSize - Current model size ('small', 'medium', 'large')
 * @param {function} props.onMaxItersChange - Callback when maxIters changes
 * @param {function} props.onEvalIntervalChange - Callback when evalInterval changes
 * @param {function} props.onModelSizeChange - Callback when modelSize changes
 * @param {boolean} props.disabled - Whether controls are disabled
 * @param {boolean} props.isTraining - Whether training is currently running
 */
export default function TrainingConfigPanel({
  maxIters = 5000,
  evalInterval = 100,
  modelSize = 'medium',
  onMaxItersChange,
  onEvalIntervalChange,
  onModelSizeChange,
  disabled = false,
  isTraining = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Model size presets with better configurations
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

  const presets = [
    { label: 'Quick Demo', maxIters: 1000, evalInterval: 50, description: 'See basics' },
    { label: 'Good Results', maxIters: 5000, evalInterval: 100, description: 'Usable text' },
    { label: 'Best Quality', maxIters: 10000, evalInterval: 100, description: 'Well trained' },
  ]

  const handlePresetClick = (preset) => {
    if (!disabled && !isTraining) {
      onMaxItersChange(preset.maxIters)
      onEvalIntervalChange(preset.evalInterval)
    }
  }

  const handleModelSizeChange = (size) => {
    if (!disabled && !isTraining) {
      onModelSizeChange(size)
      // Also update recommended steps
      onMaxItersChange(modelSizes[size].recommendedSteps)
    }
  }

  return (
    <div className="border border-neural-border rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isTraining}
        className={`
          w-full px-4 py-3 flex items-center justify-between
          bg-neural-surface hover:bg-neural-border/50
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
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
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-4 border-t border-neural-border bg-neural-surface/50"
        >
          {/* Model Size Selection */}
          <div className="mb-4">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
              Model Size (affects learning quality)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(modelSizes).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => handleModelSizeChange(key)}
                  disabled={disabled || isTraining}
                  title={size.description}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium
                    border border-neural-border
                    bg-neural-surface text-slate-300
                    hover:text-white hover:border-blue-500/60
                    transition-all duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${modelSize === key ? 'border-blue-500 text-blue-300' : ''}
                  `}
                >
                  {size.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {modelSizes[modelSize].description} • Larger models learn better but train slower
            </p>
          </div>

          {/* Training Duration Presets */}
          <div className="mb-4">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
              Training Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  disabled={disabled || isTraining}
                  title={preset.description}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium
                    border border-neural-border
                    bg-neural-surface text-slate-300
                    hover:text-white hover:border-blue-500/60
                    transition-all duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${maxIters === preset.maxIters && evalInterval === preset.evalInterval
                      ? 'border-blue-500 text-blue-300' : ''}
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Training Steps slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">
                Training Steps (more = better model)
              </label>
              <span className="text-sm text-slate-300 font-mono">{maxIters.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={500}
              value={maxIters}
              onChange={(e) => onMaxItersChange(Number(e.target.value))}
              disabled={disabled || isTraining}
              className="w-full h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:hover:bg-blue-400"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>500</span>
              <span>15,000</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recommended: {modelSizes[modelSize].recommendedSteps.toLocaleString()}+ for {modelSizes[modelSize].label} model
            </p>
          </div>

          {/* Update Frequency slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">
                Update Frequency
              </label>
              <span className="text-sm text-slate-300 font-mono">{evalInterval}</span>
            </div>
            <input
              type="range"
              min={25}
              max={200}
              step={25}
              value={evalInterval}
              onChange={(e) => onEvalIntervalChange(Number(e.target.value))}
              disabled={disabled || isTraining}
              className="w-full h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:hover:bg-blue-400"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>25</span>
              <span>200</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              How often to update charts and generate text samples (in steps)
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
