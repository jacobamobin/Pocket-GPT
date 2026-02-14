/**
 * Tab Persistence - Saves state when switching tabs, restores when returning.
 *
 * Uses sessionStorage (cleared on browser close).
 * Each tab has its own namespace to avoid conflicts.
 */

const STORAGE_KEYS = {
  WATCH_LEARN: 'watch_learn_state',
  ATTENTION_CINEMA: 'attention_cinema_state',
  STYLE_TRANSFER: 'style_transfer_state',
}

/**
 * Save tab state to sessionStorage
 */
export function saveTabState(tab, state) {
  try {
    const key = STORAGE_KEYS[tab.toUpperCase()]
    if (!key) return

    sessionStorage.setItem(key, JSON.stringify(state))
  } catch (err) {
    console.warn('Failed to save tab state:', err)
  }
}

/**
 * Load tab state from sessionStorage
 */
export function loadTabState(tab) {
  try {
    const key = STORAGE_KEYS[tab.toUpperCase()]
    if (!key) return null

    const saved = sessionStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch (err) {
    console.warn('Failed to load tab state:', err)
    return null
  }
}

/**
 * Clear tab state from sessionStorage
 */
export function clearTabState(tab) {
  try {
    const key = STORAGE_KEYS[tab.toUpperCase()]
    if (!key) return

    sessionStorage.removeItem(key)
  } catch (err) {
    console.warn('Failed to clear tab state:', err)
  }
}

/**
 * Clear all tab states
 */
export function clearAllTabStates() {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      sessionStorage.removeItem(key)
    } catch (err) {
      console.warn('Failed to clear tab state:', err)
    }
  })
}
