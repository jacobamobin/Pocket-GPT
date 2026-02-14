import { createContext, useContext, useState, useCallback } from 'react'

const GenerationContext = createContext(null)

export function GenerationProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [generatedTokens, setGeneratedTokens] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [currentProbabilities, setCurrentProbabilities] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [error, setError] = useState(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setGeneratedTokens([])
    setCurrentProbabilities([])
    setHighlightedIndex(0)
    setError(null)
  }, [])

  const addToken = useCallback((token) => {
    setGeneratedTokens(prev => [...prev, token])
  }, [])

  const value = {
    isOpen,
    userInput,
    generatedTokens,
    isPlaying,
    speed,
    currentProbabilities,
    highlightedIndex,
    error,
    actions: {
      open,
      close,
      setUserInput,
      setIsPlaying,
      setSpeed,
      setCurrentProbabilities,
      setHighlightedIndex,
      setError,
      reset,
      addToken,
    },
  }

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (!context) throw new Error('useGeneration must be used within GenerationProvider')
  return context
}
