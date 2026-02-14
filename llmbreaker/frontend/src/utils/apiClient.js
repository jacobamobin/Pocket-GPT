import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── response error interceptor ──────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Unknown error'
    return Promise.reject(new Error(message))
  }
)

// ── Datasets ─────────────────────────────────────────────────────────────────

/** @returns {Promise<import('../types').DatasetInfo[]>} */
export async function listDatasets() {
  const { data } = await api.get('/api/datasets')
  return data.datasets
}

/**
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadDataset(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/api/datasets/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * @param {string} text
 * @returns {Promise<Object>}
 */
export async function datasetFromText(text) {
  const { data } = await api.post('/api/datasets/from-text', { text })
  return data
}

// ── Sessions ──────────────────────────────────────────────────────────────────

/**
 * @param {Object} opts
 * @param {string} opts.feature_type
 * @param {string} opts.dataset_id
 * @param {Object} [opts.hyperparameters]
 * @returns {Promise<Object>}
 */
export async function createSession({ feature_type, dataset_id, hyperparameters = {} }) {
  const { data } = await api.post('/api/sessions/create', {
    feature_type,
    dataset_id,
    hyperparameters,
  })
  return data
}

/**
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSession(sessionId) {
  const { data } = await api.get(`/api/sessions/${sessionId}`)
  return data
}

/**
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function deleteSession(sessionId) {
  const { data } = await api.delete(`/api/sessions/${sessionId}`)
  return data
}

export default api
