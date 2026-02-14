import { useContext } from 'react'
import { TrainingContext } from '../../contexts/TrainingContext'

export default function Header({ connected }) {
  const { state } = useContext(TrainingContext)

  const activeSessions = Object.values(state.sessions).filter(
    s => s.status === 'running' || s.status === 'paused'
  )

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-neural-border bg-neural-surface shrink-0">
      {/* Logo */}
      <span
        className="text-xl font-bold text-transparent bg-clip-text select-none"
        style={{ backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #06B6D4 100%)' }}
      >
        LLMBreaker
      </span>

      {/* Right side */}
      <div className="flex items-center gap-4 text-sm">
        {/* Active sessions badge */}
        {activeSessions.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300"
            title={activeSessions.map(s => `${s.sessionId.slice(0, 8)} (${s.status})`).join('\n')}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            <span>{activeSessions.length} training</span>
          </div>
        )}

        {/* WebSocket status */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-cyan-400' : 'bg-slate-600'}`}
          />
          <span className={connected ? 'text-slate-400' : 'text-slate-600'}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
