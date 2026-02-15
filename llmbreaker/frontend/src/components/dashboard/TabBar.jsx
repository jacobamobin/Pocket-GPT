import { useContext } from 'react'
import { motion } from 'framer-motion'
import { FiEye, FiFilm, FiFeather } from 'react-icons/fi'
import { UIContext }    from '../../contexts/UIContext'
import { FEATURE_TYPE } from '../../types/index.js'

const TABS = [
  { id: FEATURE_TYPE.WATCH_LEARN,      label: 'Watch It Learn',   Icon: FiEye },
  { id: FEATURE_TYPE.ATTENTION_CINEMA, label: 'Attention Cinema', Icon: FiFilm },
  { id: FEATURE_TYPE.STYLE_TRANSFER,   label: 'Style Transfer',   Icon: FiFeather },
]

export default function TabBar() {
  const { state, dispatch } = useContext(UIContext)

  return (
    <nav
      className="flex border-b border-white/10 bg-neural-bg shrink-0 px-2"
      role="tablist"
    >
      {TABS.map(tab => {
        const isActive = state.activeTab === tab.id
        const Icon = tab.Icon
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`
              relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium
              transition-colors duration-150 outline-none
              ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}
            `}
            title={tab.label}
            data-tutorial={`tab-${tab.id}`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>

            {/* Active indicator bar — animate with Framer Motion layout */}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-base to-gold-light"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
