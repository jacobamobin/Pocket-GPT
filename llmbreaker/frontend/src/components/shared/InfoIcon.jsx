import { useContext } from 'react'
import { UIContext } from '../../contexts/UIContext'

export default function InfoIcon({ topicId }) {
  const { dispatch } = useContext(UIContext)

  return (
    <button
      onClick={() => dispatch({ type: 'OPEN_INFO_DRAWER', payload: topicId })}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full
                 text-slate-500 hover:text-blue-400 transition-colors duration-150
                 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
      aria-label="Learn more"
      title="Learn more"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
      </svg>
    </button>
  )
}
