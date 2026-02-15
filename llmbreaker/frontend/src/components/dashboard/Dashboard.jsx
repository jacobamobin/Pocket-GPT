import { useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UIContext }      from '../../contexts/UIContext'
import { useTutorial }    from '../../contexts/TutorialContext'
import { FEATURE_TYPE }   from '../../types/index.js'
import { useWebSocket }   from '../../hooks/useWebSocket'
import Header             from './Header'
import TabBar             from './TabBar'
import InfoDrawer         from '../shared/InfoDrawer'
import TutorialSpotlight from '../tutorial/TutorialSpotlight'
import TutorialWelcome   from '../tutorial/TutorialWelcome'
import TutorialSwitchPrompt from '../tutorial/TutorialSwitchPrompt'
import GenerationDrawer from '../generation/GenerationDrawer'
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
  const { state: tutorial, actions: tutorialActions } = useTutorial()
  const { connected }                       = useWebSocket()
  const [previousTab, setPreviousTab]       = useState(ui.activeTab)
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false)
  const [pendingTab, setPendingTab]         = useState(null)

  useEffect(() => {
    if (!ui.successToast) return
    const t = setTimeout(() => uiDispatch({ type: 'CLEAR_SUCCESS' }), 3000)
    return () => clearTimeout(t)
  }, [ui.successToast, uiDispatch])

  // Auto-switch to correct tab when tutorial chapter starts
  useEffect(() => {
    if (!tutorial.active || tutorial.chapterId === 'welcome') return

    const chapterToTab = {
      'watch_learn': FEATURE_TYPE.WATCH_LEARN,
      'attention_cinema': FEATURE_TYPE.ATTENTION_CINEMA,
      'style_transfer': FEATURE_TYPE.STYLE_TRANSFER,
    }

    const requiredTab = chapterToTab[tutorial.chapterId]
    if (requiredTab && ui.activeTab !== requiredTab) {
      uiDispatch({ type: 'SET_TAB', payload: requiredTab })
    }
  }, [tutorial.active, tutorial.chapterId, ui.activeTab, uiDispatch])

  // Tutorial chapter tab switch detection
  useEffect(() => {
    if (!tutorial.active || tutorial.chapterId === 'welcome') {
      setPreviousTab(ui.activeTab)
      return
    }

    // Map tabs to their expected chapter IDs
    const tabToChapter = {
      [FEATURE_TYPE.WATCH_LEARN]: 'watch_learn',
      [FEATURE_TYPE.ATTENTION_CINEMA]: 'attention_cinema',
      [FEATURE_TYPE.STYLE_TRANSFER]: 'style_transfer',
    }

    const expectedChapter = tabToChapter[ui.activeTab]

    // If user switched to a tab that doesn't match current tutorial chapter
    if (expectedChapter && expectedChapter !== tutorial.chapterId && ui.activeTab !== previousTab) {
      setPendingTab(ui.activeTab)
      setShowSwitchPrompt(true)
      // Switch back to previous tab until user decides
      setTimeout(() => {
        uiDispatch({ type: 'SET_TAB', payload: previousTab })
      }, 0)
    } else {
      setPreviousTab(ui.activeTab)
    }
  }, [ui.activeTab, tutorial.active, tutorial.chapterId, previousTab, uiDispatch])

  const handleSwitchStay = () => {
    setShowSwitchPrompt(false)
    setPendingTab(null)
  }

  const handleSwitchChapter = () => {
    setShowSwitchPrompt(false)
    if (pendingTab) {
      const tabToChapter = {
        [FEATURE_TYPE.WATCH_LEARN]: 'watch_learn',
        [FEATURE_TYPE.ATTENTION_CINEMA]: 'attention_cinema',
        [FEATURE_TYPE.STYLE_TRANSFER]: 'style_transfer',
      }
      tutorialActions.setChapter(tabToChapter[pendingTab])
      uiDispatch({ type: 'SET_TAB', payload: pendingTab })
      setPendingTab(null)
    }
  }

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

      {/* Success toast */}
      <AnimatePresence>
        {ui.successToast && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-2 px-4 py-2.5 rounded-lg bg-neural-surface/70 border border-gold-muted
                       text-gold-light text-sm flex items-center justify-between"
          >
            <span>{ui.successToast}</span>
            <button
              onClick={() => uiDispatch({ type: 'CLEAR_SUCCESS' })}
              className="ml-4 text-gold-base hover:text-gold-hover transition-colors text-lg leading-none"
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
      <TutorialSpotlight />
      <TutorialWelcome />
      <GenerationDrawer />

      {/* Chapter switch prompt */}
      <AnimatePresence>
        {showSwitchPrompt && (
          <TutorialSwitchPrompt
            currentChapter={tutorial.chapterId}
            onStay={handleSwitchStay}
            onSwitch={handleSwitchChapter}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
