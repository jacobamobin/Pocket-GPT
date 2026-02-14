import { useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UIContext }      from '../../contexts/UIContext'
import { FEATURE_TYPE }   from '../../types/index.js'
import { useWebSocket }   from '../../hooks/useWebSocket'
import Header             from './Header'
import TabBar             from './TabBar'
import InfoDrawer         from '../shared/InfoDrawer'
import WatchItLearnTab    from '../tabs/WatchItLearnTab'
import AttentionCinemaTab from '../tabs/AttentionCinemaTab'
import StyleTransferTab   from '../tabs/StyleTransferTab'

function TabContent({ activeTab }) {
  if (activeTab === FEATURE_TYPE.WATCH_LEARN)      return <WatchItLearnTab />
  if (activeTab === FEATURE_TYPE.ATTENTION_CINEMA) return <AttentionCinemaTab />
  if (activeTab === FEATURE_TYPE.STYLE_TRANSFER)   return <StyleTransferTab />
  return null
}

export default function Dashboard() {
  const { state: ui, dispatch: uiDispatch } = useContext(UIContext)
  const { connected }                       = useWebSocket()

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-neural-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header connected={connected} />
      <TabBar />

      {/* Error toast */}
      <AnimatePresence>
        {ui.errorToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-3 px-4 py-2.5 rounded-lg bg-blue-950/70 border border-blue-500/40
                       text-blue-200 text-sm flex items-center justify-between"
          >
            <span>{ui.errorToast}</span>
            <button
              onClick={() => uiDispatch({ type: 'CLEAR_ERROR' })}
              className="ml-4 text-blue-400 hover:text-white transition-colors text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={ui.activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <TabContent activeTab={ui.activeTab} />
          </motion.div>
        </AnimatePresence>
      </main>
      <InfoDrawer />
    </motion.div>
  )
}
