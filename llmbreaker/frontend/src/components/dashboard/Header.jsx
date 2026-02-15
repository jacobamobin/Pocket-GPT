import { useContext } from 'react'
import { FiPlay } from 'react-icons/fi'
import { TrainingContext } from '../../contexts/TrainingContext'
import { useGeneration } from '../../contexts/GenerationContext'
import ModelDropdown from './ModelDropdown'
import TutorialButton from '../tutorial/TutorialButton'

export default function Header({ connected }) {
  const { state } = useContext(TrainingContext)
  const { actions: genActions } = useGeneration()

  const activeSessions = Object.values(state.sessions).filter(
    s => s.status === 'running' || s.status === 'paused'
  )

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neural-bg/80 backdrop-blur-xl shrink-0">
      {/* Logo */}
      <span
        className="text-2xl font-serif italic font-bold text-white select-none"
        data-tutorial="logo"
      >
        LLMBreaker
      </span>

      {/* Right side */}
      <div className="flex items-center gap-4 text-sm">
        {/* Active sessions badge */}
        {activeSessions.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-subtle border border-gold-muted text-gold-light"
            title={activeSessions.map(s => `${s.sessionId.slice(0, 8)} (${s.status})`).join('\n')}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span>{activeSessions.length} training</span>
          </div>
        )}

        {/* Model library dropdown */}
        <ModelDropdown />

        {/* Playground button */}
        <button
          onClick={genActions.open}
          className="px-3 py-1.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-gold-base/50 rounded-lg transition-colors flex items-center gap-1.5"
          aria-label="Open Token Playground"
        >
          <FiPlay className="w-4 h-4" />
          <span className="hidden md:inline">Playground</span>
        </button>

        {/* Tutorial button */}
        <TutorialButton />

        {/* WebSocket status */}
        <div className="flex items-center gap-1.5 text-white/60">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className={connected ? 'text-white/60' : 'text-white/40'}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
