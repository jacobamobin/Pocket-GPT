export default function ViewModeToggle({ viewMode, onViewMode, renderMode, onRenderMode }) {
  const btnBase = `
    px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150
    focus:outline-none focus:ring-1 focus:ring-blue-500/60
  `
  const active   = 'border-blue-500 bg-blue-500/20 text-blue-300'
  const inactive = 'border-neural-border bg-neural-surface text-slate-400 hover:text-slate-200'

  return (
    <div className="card flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">View Mode</h3>

      {/* Evolution / Grid / Detail */}
      <div className="flex flex-wrap gap-1">
        {['evolution', 'grid', 'detail'].map(mode => (
          <button
            key={mode}
            onClick={() => onViewMode(mode)}
            className={`${btnBase} ${viewMode === mode ? active : inactive}`}
            title={
              mode === 'evolution' ? 'Evolution: Watch attention learn over time' :
              mode === 'grid' ? 'Grid: See all layers/heads at once' :
              'Detail: Drill into one head'
            }
          >
            {mode === 'evolution' ? 'Evolution' :
             mode === 'grid' ? 'Grid' :
             'Detail'}
          </button>
        ))}
      </div>

      {/* 2D / 3D */}
      <div className="flex gap-1">
        {['2d', '3d'].map(mode => (
          <button
            key={mode}
            onClick={() => onRenderMode(mode)}
            className={`${btnBase} ${renderMode === mode ? active : inactive}`}
            title={mode === '3d' ? '3D shows attention as bar heights' : '2D heatmap view'}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
