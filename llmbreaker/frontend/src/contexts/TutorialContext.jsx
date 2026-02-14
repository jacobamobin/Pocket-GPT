import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

/**
 * TutorialContext — guided spotlight tutorial state management.
 *
 * State shape:
 * {
 *   active: boolean              // Is tutorial currently running?
 *   chapterId: string | null     // Current chapter: 'welcome' | 'watch_learn' | 'attention_cinema' | 'style_transfer'
 *   stepIndex: number            // Current step within chapter (0-based)
 *   completedChapters: string[]  // Chapter IDs user has finished
 *   dismissedWelcome: boolean    // Has user seen first-visit overlay?
 * }
 */

const STORAGE_KEY = 'llmbreaker_tutorial'

// Load from localStorage
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        active: false,
        chapterId: null,
        stepIndex: 0,
        completedChapters: parsed.completedChapters || [],
        dismissedWelcome: parsed.dismissedWelcome || false,
      }
    }
  } catch (e) {
    console.warn('Failed to load tutorial state:', e)
  }
  return {
    active: false,
    chapterId: null,
    stepIndex: 0,
    completedChapters: [],
    dismissedWelcome: false,
  }
}

// Save to localStorage
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completedChapters: state.completedChapters,
      dismissedWelcome: state.dismissedWelcome,
    }))
  } catch (e) {
    console.warn('Failed to save tutorial state:', e)
  }
}

const initialState = loadState()

function reducer(state, action) {
  switch (action.type) {
    case 'START_TUTORIAL':
      return {
        ...state,
        active: true,
        chapterId: action.payload.chapterId || 'welcome',
        stepIndex: 0,
      }

    case 'NEXT_STEP':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
      }

    case 'PREV_STEP':
      return {
        ...state,
        stepIndex: Math.max(0, state.stepIndex - 1),
      }

    case 'SET_CHAPTER':
      return {
        ...state,
        active: true,
        chapterId: action.payload,
        stepIndex: 0,
      }

    case 'COMPLETE_CHAPTER':
      const completed = state.completedChapters.includes(state.chapterId)
        ? state.completedChapters
        : [...state.completedChapters, state.chapterId]

      return {
        ...state,
        active: false,
        chapterId: null,
        stepIndex: 0,
        completedChapters: completed,
      }

    case 'END_TUTORIAL':
      return {
        ...state,
        active: false,
        chapterId: null,
        stepIndex: 0,
      }

    case 'DISMISS_WELCOME':
      return {
        ...state,
        dismissedWelcome: true,
      }

    case 'RESET_PROGRESS':
      return {
        ...state,
        active: false,
        chapterId: null,
        stepIndex: 0,
        completedChapters: [],
        dismissedWelcome: false,
      }

    default:
      return state
  }
}

export const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Persist to localStorage when relevant state changes
  useEffect(() => {
    saveState(state)
  }, [state.completedChapters, state.dismissedWelcome])

  // Convenience methods
  const startTutorial = useCallback((chapterId) => {
    dispatch({ type: 'START_TUTORIAL', payload: { chapterId } })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' })
  }, [])

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
  }, [])

  const setChapter = useCallback((chapterId) => {
    dispatch({ type: 'SET_CHAPTER', payload: chapterId })
  }, [])

  const completeChapter = useCallback(() => {
    dispatch({ type: 'COMPLETE_CHAPTER' })
  }, [])

  const endTutorial = useCallback(() => {
    dispatch({ type: 'END_TUTORIAL' })
  }, [])

  const dismissWelcome = useCallback(() => {
    dispatch({ type: 'DISMISS_WELCOME' })
  }, [])

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' })
  }, [])

  const isChapterCompleted = useCallback((chapterId) => {
    return state.completedChapters.includes(chapterId)
  }, [state.completedChapters])

  const value = {
    state,
    actions: {
      startTutorial,
      nextStep,
      prevStep,
      setChapter,
      completeChapter,
      endTutorial,
      dismissWelcome,
      resetProgress,
      isChapterCompleted,
    },
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}
