import { useContext } from 'react'
import { motion } from 'framer-motion'
import { UIContext }    from '../../contexts/UIContext'
import { FEATURE_TYPE } from '../../types/index.js'

const TABS = [
  { id: FEATURE_TYPE.WATCH_LEARN,      label: 'Watch It Learn',   icon: '📝' },
  { id: FEATURE_TYPE.ATTENTION_CINEMA, label: 'Attention Cinema', icon: '🎬' },
  { id: FEATURE_TYPE.STYLE_TRANSFER,   label: 'Style Transfer',   icon: '✨' },
]

export default function TabBar() {
  const { state, dispatch } = useContext(UIContext)

  return (
    <nav
      className="flex border-b border-neural-border bg-neural-surface shrink-0 px-2"
      role="tablist"
    >
      {TABS.map(tab => {
        const isActive = state.activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`
              relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium
              transition-colors duration-150 outline-none
              ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
            `}
            title={tab.label}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>

            {/* Active indicator bar — animate with Framer Motion layout */}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
