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
            className="w-9 h-9 flex items-center justify-center bg-white text-black hover:bg-gold-hover disabled:bg-white/10 disabled:text-white/30 rounded-lg transition-colors text-sm"
          >
            ▶
          </button>
        ) : (
          <button
            onClick={() => actions.setIsPlaying(false)}
            title="Pause"
            className="w-9 h-9 flex items-center justify-center bg-white text-black hover:bg-gold-hover rounded-lg transition-colors text-sm"
          >
            ⏸
          </button>
        )}

        <button
          onClick={onStep}
          disabled={disabled}
          title="Step — generate one token (accepts highlighted option)"
          className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/20 text-white/60 rounded-lg transition-colors text-xs"
        >
          ▶|
        </button>

        <button
          onClick={actions.reset}
          disabled={disabled}
          title="Regenerate — clear output and start over"
          className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/20 text-white/60 rounded-lg transition-colors"
        >
          ↻
        </button>

        <div className="ml-auto flex items-center gap-2 text-xs text-white/30">
          <span>Speed</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={e => actions.setSpeed(Number(e.target.value))}
            className="w-24 accent-gold-base"
          />
          <span className="w-12 text-white/40">{speed}ms</span>
        </div>
      </div>
    </div>
  )
}
