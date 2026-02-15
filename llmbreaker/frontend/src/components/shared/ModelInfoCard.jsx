export default function ModelInfoCard({ modelConfig }) {
  if (!modelConfig) return null

  const { n_embd = 0, n_layer = 0, n_head = 0, block_size = 0, vocab_size = 0, dropout = 0 } = modelConfig

  const attn_params = n_layer * (4 * n_embd * n_embd)
  const ff_params = n_layer * (8 * n_embd * n_embd)
  const emb_params = vocab_size * n_embd
  const pos_params = block_size * n_embd
  const total_params = attn_params + ff_params + emb_params + pos_params
  const param_label = total_params >= 1e6
    ? `${(total_params / 1e6).toFixed(2)}M`
    : `${(total_params / 1e3).toFixed(1)}K`

  const stats = [
    { label: 'Layers', value: n_layer },
    { label: 'Heads', value: n_head },
    { label: 'Embed dim', value: n_embd },
    { label: 'Context', value: block_size },
    { label: 'Vocab', value: vocab_size },
    { label: 'Dropout', value: dropout.toFixed(2) },
    { label: '~Params', value: param_label },
  ]

  return (
    <div className="card py-3">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Model Architecture</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/30">{label}</span>
            <span className="text-xs font-mono text-white/60">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
