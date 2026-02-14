import { useEffect, useRef } from 'react'
import { saveTabState, loadTabState, clearTabState } from '../utils/tabPersistence'

/**
 * Hook to persist and restore tab state when navigating between tabs.
 *
 * @param {string} tabKey - Tab identifier (e.g., 'watch_learn', 'attention_cinema', 'style_transfer')
 * @param {object} state - Current state to persist
 *
 * @returns {object} - { savedState: previously saved state, clear: function to clear state }
 *
 * Usage:
 *   const { savedState, clear } = useTabPersistence('watch_learn', { datasetId, maxIters, ... })
 *
 *   On mount: loads previously saved state into `savedState`
 *   On unmount: saves current `state` to sessionStorage
 *   Call `clear()` when user wants to start fresh (e.g., after training completes)
 */
export function useTabPersistence(tabKey, state) {
  const isRestored = useRef(false)

  // Load saved state on first mount
  useEffect(() => {
    if (!isRestored.current) {
      isRestored.current = true
    }
  }, [])

  // Save state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (state) {
        saveTabState(tabKey, state)
      }
    }
  }, [tabKey, state])

  // Return saved state and clear function
  const savedState = loadTabState(tabKey)

  const clear = () => {
    clearTabState(tabKey)
  }

  return { savedState, clear }
}
