import { createContext, useReducer, useEffect } from 'react'
import { listModels } from '../utils/apiClient'

const initialState = {
  models: [],
  loading: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODELS':
      return { ...state, models: action.payload, loading: false }
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] }
    case 'UPDATE_MODEL': {
      const { id, name } = action.payload
      return {
        ...state,
        models: state.models.map(m => m.id === id ? { ...m, name } : m),
      }
    }
    case 'REMOVE_MODEL':
      return { ...state, models: state.models.filter(m => m.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const ModelContext = createContext(null)

export function ModelProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    listModels()
      .then(models => dispatch({ type: 'SET_MODELS', payload: models }))
      .catch(() => dispatch({ type: 'SET_MODELS', payload: [] }))
  }, [])

  return (
    <ModelContext.Provider value={{ state, dispatch }}>
      {children}
    </ModelContext.Provider>
  )
}
