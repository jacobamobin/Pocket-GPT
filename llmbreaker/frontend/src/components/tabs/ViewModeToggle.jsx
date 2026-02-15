export default function ViewModeToggle({ viewMode, onViewMode, renderMode, onRenderMode, className = '' }) {
  return (
    <div className={`card flex flex-col gap-3 ${className}`}>
      <h3 className="section-header">View Mode</h3>

      {/* Evolution / Grid / Detail */}
      <div className="flex flex-wrap gap-1">
        {['evolution', 'grid', 'detail'].map(mode => (
          <button
            key={mode}
            onClick={() => onViewMode(mode)}
            className={`toggle-btn ${viewMode === mode ? 'active' : 'inactive'}`}
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
            className={`toggle-btn ${renderMode === mode ? 'active' : 'inactive'}`}
            title={mode === '3d' ? '3D shows attention as bar heights' : '2D heatmap view'}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
