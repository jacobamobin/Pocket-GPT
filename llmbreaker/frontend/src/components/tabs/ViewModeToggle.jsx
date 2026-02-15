import { FiLayers, FiGrid, FiZoomIn, FiBox, FiSquare } from 'react-icons/fi'

const VIEW_MODES = [
  { id: 'evolution', label: 'Evolution', icon: FiLayers },
  { id: 'grid', label: 'Grid', icon: FiGrid },
  { id: 'detail', label: 'Detail', icon: FiZoomIn },
]

const RENDER_MODES = [
  { id: '2d', label: '2D', icon: FiSquare },
  { id: '3d', label: '3D', icon: FiBox },
]

function SegmentedControl({ items, value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 gap-0.5">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = value === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-gold-subtle text-gold-light border border-gold-muted shadow-sm'
                : 'text-white/40 hover:text-white/60 border border-transparent'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function ViewModeToggle({ viewMode, onViewMode, renderMode, onRenderMode, className = '' }) {
  return (
    <div className={`card flex flex-col gap-4 ${className}`}>
      <h3 className="section-header">View Mode</h3>

      <div className="flex flex-col gap-3">
        <SegmentedControl items={VIEW_MODES} value={viewMode} onChange={onViewMode} />
        <SegmentedControl items={RENDER_MODES} value={renderMode} onChange={onRenderMode} />
      </div>
    </div>
  )
}
