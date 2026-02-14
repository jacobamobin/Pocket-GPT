import { useGeneration } from '../../contexts/GenerationContext'

export default function GenerationControls({ disabled, onStep }) {
  const { isPlaying, speed, actions } = useGeneration()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={() => actions.setIsPlaying(true)}
            disabled={disabled}
            title="Play"
            className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            ▶
          </button>
        ) : (
          <button
            onClick={() => actions.setIsPlaying(false)}
            title="Pause"
            className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
          >
            ⏸
          </button>
        )}

        <button
          onClick={onStep}
          disabled={disabled}
          title="Step — generate one token (accepts highlighted option)"
          className="w-9 h-9 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded-lg transition-colors text-xs"
        >
          ▶|
        </button>

        <button
          onClick={actions.reset}
          disabled={disabled}
          title="Regenerate — clear output and start over"
          className="w-9 h-9 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded-lg transition-colors"
        >
          ↻
        </button>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Speed</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={e => actions.setSpeed(Number(e.target.value))}
            className="w-24 accent-cyan-500"
          />
          <span className="w-12 text-slate-400">{speed}ms</span>
        </div>
      </div>
    </div>
  )
}
