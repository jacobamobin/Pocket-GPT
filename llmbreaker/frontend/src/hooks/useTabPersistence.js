import { useEffect, useRef, useState, useCallback } from 'react'
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
  // Load saved state once on mount
  const [savedState] = useState(() => loadTabState(tabKey))

  // Keep a ref to the latest state so the unmount cleanup always saves current values
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state })

  // Save state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (stateRef.current) {
        saveTabState(tabKey, stateRef.current)
      }
    }
  }, [tabKey])

  const clear = useCallback(() => {
    clearTabState(tabKey)
  }, [tabKey])

  return { savedState, clear }
}
