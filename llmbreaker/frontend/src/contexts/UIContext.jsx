import { createContext, useReducer } from 'react'
import { FEATURE_TYPE } from '../types/index.js'

/**
 * UIContext — tab state, modals, tooltips, global UI flags.
 *
 * State shape:
 * {
 *   activeTab:    FeatureType
 *   tooltipId:    string | null     (id of currently open tooltip)
 *   errorToast:   string | null     (message to display)
 *   isLoading:    boolean
 * }
 */

const initialState = {
  activeTab:  FEATURE_TYPE.WATCH_LEARN,
  tooltipId:  null,
  errorToast: null,
  isLoading:  false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload }
    case 'SHOW_TOOLTIP':
      return { ...state, tooltipId: action.payload }
    case 'HIDE_TOOLTIP':
      return { ...state, tooltipId: null }
    case 'SHOW_ERROR':
      return { ...state, errorToast: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, errorToast: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

export const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  )
}
