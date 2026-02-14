import { useContext } from 'react'
import { UIContext }      from '../../contexts/UIContext'
import { TrainingContext } from '../../contexts/TrainingContext'
import { useWebSocket }   from '../../hooks/useWebSocket'
import { FEATURE_TYPE }   from '../../types/index.js'
import WatchItLearnTab    from '../tabs/WatchItLearnTab'
import AttentionCinemaTab from '../tabs/AttentionCinemaTab'
import StyleTransferTab   from '../tabs/StyleTransferTab'

const TABS = [
  { id: FEATURE_TYPE.WATCH_LEARN,      label: 'Watch It Learn',   icon: '📝' },
  { id: FEATURE_TYPE.ATTENTION_CINEMA, label: 'Attention Cinema', icon: '🎬' },
  { id: FEATURE_TYPE.STYLE_TRANSFER,   label: 'Style Transfer',   icon: '✨' },
]

function TabContent({ activeTab }) {
  if (activeTab === FEATURE_TYPE.WATCH_LEARN)      return <WatchItLearnTab />
  if (activeTab === FEATURE_TYPE.ATTENTION_CINEMA) return <AttentionCinemaTab />
  if (activeTab === FEATURE_TYPE.STYLE_TRANSFER)   return <StyleTransferTab />
  return null
}

export default function Dashboard() {
  const { state: ui, dispatch: uiDispatch } = useContext(UIContext)
  const { state: training }                 = useContext(TrainingContext)
  const { connected }                       = useWebSocket()

  const activeSessions = Object.values(training.sessions).filter(
    s => s.status === 'running' || s.status === 'paused'
  )

  return (
    <div className="min-h-screen bg-neural-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neural-border bg-neural-surface">
        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          LLMBreaker
        </span>
        <div className="flex items-center gap-3 text-sm">
          {/* WebSocket status */}
          <span className={`flex items-center gap-1.5 ${connected ? 'text-cyan-400' : 'text-blue-900'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-400' : 'bg-blue-900'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          {/* Active sessions badge */}
          {activeSessions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40"
              title={activeSessions.map(s => s.sessionId).join(', ')}>
              {activeSessions.length} training
            </span>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <nav className="flex border-b border-neural-border bg-neural-surface px-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => uiDispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${ui.activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-blue-400 hover:text-white hover:border-blue-500/40'}
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Error toast */}
      {ui.errorToast && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-lg bg-blue-900/60 border border-blue-500/50 text-blue-200 text-sm flex justify-between">
          <span>{ui.errorToast}</span>
          <button
            onClick={() => uiDispatch({ type: 'CLEAR_ERROR' })}
            className="ml-4 text-blue-400 hover:text-white"
          >×</button>
        </div>
      )}

      {/* Tab content */}
      <main className="flex-1 p-6 overflow-auto">
        <TabContent activeTab={ui.activeTab} />
      </main>
    </div>
  )
}
