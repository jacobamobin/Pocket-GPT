import { createContext, useReducer } from 'react'

/**
 * MetricsContext — stores all training data streams per session.
 *
 * State shape:
 * {
 *   [sessionId]: {
 *     lossHistory:        TrainingMetrics[]
 *     samples:            GeneratedSample[]
 *     attentionSnapshots: AttentionSnapshot[]   (keyed by step+layer+head)
 *     finalStats:         { finalTrainLoss, finalValLoss, totalTime } | null
 *   }
 * }
 */

const initialState = {}

function makeEmpty() {
  return {
    lossHistory:        [],
    samples:            [],
    attentionSnapshots: [],
    finalStats:         null,
  }
}

function reducer(state, action) {
  switch (action.type) {

    case 'INIT_SESSION': {
      const { sessionId } = action.payload
      if (state[sessionId]) return state
      return { ...state, [sessionId]: makeEmpty() }
    }

    case 'ADD_METRICS': {
      const { session_id, step, train_loss, val_loss, timestamp } = action.payload
      const prev = state[session_id] ?? makeEmpty()
      return {
        ...state,
        [session_id]: {
          ...prev,
          lossHistory: [
            ...prev.lossHistory,
            { step, train_loss, val_loss, timestamp },
          ],
        },
      }
    }

    case 'ADD_SAMPLE': {
      const { session_id, step, text, prompt, timestamp } = action.payload
      const prev = state[session_id] ?? makeEmpty()
      return {
        ...state,
        [session_id]: {
          ...prev,
          samples: [...prev.samples, { step, text, prompt, timestamp }],
        },
      }
    }

    case 'ADD_ATTENTION': {
      const { session_id, step, layer, head, matrix, tokens, timestamp } = action.payload
      const prev = state[session_id] ?? makeEmpty()
      // Keep all snapshots for timeline playback (max ~40 total: 10 steps × 4 heads)
      return {
        ...state,
        [session_id]: {
          ...prev,
          attentionSnapshots: [
            ...prev.attentionSnapshots,
            { step, layer, head, matrix, tokens, timestamp },
          ],
        },
      }
    }

    case 'SET_COMPLETED': {
      const { sessionId, final_train_loss, final_val_loss, total_time_seconds } = action.payload
      const prev = state[sessionId] ?? makeEmpty()
      return {
        ...state,
        [sessionId]: {
          ...prev,
          finalStats: {
            finalTrainLoss: final_train_loss,
            finalValLoss:   final_val_loss,
            totalTime:      total_time_seconds,
          },
        },
      }
    }

    case 'CLEAR_SESSION': {
      const { sessionId } = action.payload
      const { [sessionId]: _, ...rest } = state
      return rest
    }

    default:
      return state
  }
}

export const MetricsContext = createContext(null)

export function MetricsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <MetricsContext.Provider value={{ state, dispatch }}>
      {children}
    </MetricsContext.Provider>
  )
}
