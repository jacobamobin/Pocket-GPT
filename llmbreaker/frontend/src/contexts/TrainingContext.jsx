import { createContext, useReducer } from 'react'

/**
 * TrainingContext — tracks active sessions and their statuses.
 *
 * State shape:
 * {
 *   sessions: {
 *     [sessionId]: {
 *       sessionId, featureType, status, currentIter, maxIters,
 *       modelConfig, trainingConfig, createdAt, startedAt, error
 *     }
 *   },
 *   activeSessionId: string | null   (currently visible session)
 * }
 */

const initialState = {
  sessions: {},
  activeSessionId: null,
}

function reducer(state, action) {
  switch (action.type) {

    case 'CREATE_SESSION': {
      const { sessionId, featureType, status, modelConfig, trainingConfig } = action.payload
      return {
        ...state,
        activeSessionId: sessionId,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            sessionId,
            featureType,
            status:        status ?? 'idle',
            currentIter:   0,
            maxIters:      trainingConfig?.max_iters ?? 500,
            modelConfig:   modelConfig  ?? {},
            trainingConfig: trainingConfig ?? {},
            createdAt:     Date.now(),
            startedAt:     null,
            error:         null,
          },
        },
      }
    }

    case 'SESSION_STARTED': {
      const { session_id } = action.payload
      if (!state.sessions[session_id]) return state
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session_id]: {
            ...state.sessions[session_id],
            status:    'running',
            startedAt: Date.now(),
          },
        },
      }
    }

    case 'UPDATE_STATUS': {
      const { sessionId, status, error = null, currentIter } = action.payload
      if (!state.sessions[sessionId]) return state
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...state.sessions[sessionId],
            status,
            error,
            ...(currentIter !== undefined ? { currentIter } : {}),
          },
        },
      }
    }

    case 'UPDATE_ITER': {
      const { sessionId, currentIter } = action.payload
      if (!state.sessions[sessionId]) return state
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: { ...state.sessions[sessionId], currentIter },
        },
      }
    }

    case 'SESSION_COMPLETED': {
      const { session_id } = action.payload
      if (!state.sessions[session_id]) return state
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session_id]: {
            ...state.sessions[session_id],
            status:    'completed',
            currentIter: state.sessions[session_id].maxIters,
          },
        },
      }
    }

    case 'REMOVE_SESSION': {
      const { sessionId } = action.payload
      const { [sessionId]: _, ...rest } = state.sessions
      return {
        ...state,
        sessions: rest,
        activeSessionId:
          state.activeSessionId === sessionId ? null : state.activeSessionId,
      }
    }

    case 'SET_ACTIVE': {
      return { ...state, activeSessionId: action.payload.sessionId }
    }

    default:
      return state
  }
}

export const TrainingContext = createContext(null)

export function TrainingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <TrainingContext.Provider value={{ state, dispatch }}>
      {children}
    </TrainingContext.Provider>
  )
}
