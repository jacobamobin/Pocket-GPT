import { useContext } from 'react'
import { FiInfo } from 'react-icons/fi'
import { UIContext } from '../../contexts/UIContext'

export default function InfoIcon({ topicId }) {
  const { dispatch } = useContext(UIContext)

  return (
    <button
      onClick={() => dispatch({ type: 'OPEN_INFO_DRAWER', payload: topicId })}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full
                 text-white/40 hover:text-gold-base transition-colors duration-150"
      aria-label="Learn more"
      title="Learn more"
    >
      <FiInfo className="w-4 h-4" />
    </button>
  )
}
