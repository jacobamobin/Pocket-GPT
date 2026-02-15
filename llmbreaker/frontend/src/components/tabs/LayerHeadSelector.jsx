export default function LayerHeadSelector({ layer, head, nLayers = 2, nHeads = 2, onLayer, onHead }) {
  const selectClass = `
    bg-neural-surface border border-neural-border rounded-md px-2 py-1.5
    text-sm text-white focus:outline-none focus:border-gold-base
  `

  return (
    <div className="card flex items-center gap-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider shrink-0">
        Viewing
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30">Layer</span>
        <select value={layer} onChange={e => onLayer(Number(e.target.value))} className={selectClass}>
          {Array.from({ length: nLayers }, (_, i) => (
            <option key={i} value={i}>Layer {i}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30">Head</span>
        <select value={head} onChange={e => onHead(Number(e.target.value))} className={selectClass}>
          {Array.from({ length: nHeads }, (_, i) => (
            <option key={i} value={i}>Head {i}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
