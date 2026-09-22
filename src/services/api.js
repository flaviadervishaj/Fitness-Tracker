const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const getAuthToken = () => localStorage.getItem('token')

const createApiError = (message, code, status) => {
  const error = new Error(message)
  error.code = code
  error.status = status
  return error
}

async function apiCall(endpoint, options = {}) {
  const token = getAuthToken()
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  } catch {
    throw createApiError('Unable to connect to the server', 'NETWORK_ERROR')
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : null

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    throw createApiError(
      data?.error || 'Authentication required',
      'AUTH_REQUIRED',
      response.status,
    )
  }

  if (!response.ok) {
    throw createApiError(
      data?.error || `Request failed with status ${response.status}`,
      'API_ERROR',
      response.status,
    )
  }

  if (!data) {
    throw createApiError('The server returned an invalid response', 'INVALID_RESPONSE')
  }

  return data
}

export const exerciseAPI = {
  getAll: () => apiCall('/exercises'),
  getById: (id) => apiCall(`/exercises/${id}`),
  create: (exercise) => apiCall('/exercises', { method: 'POST', body: exercise }),
}

export const workoutAPI = {
  getAll: () => apiCall('/workouts'),
  getById: (id) => apiCall(`/workouts/${id}`),
  create: (workout) => apiCall('/workouts', { method: 'POST', body: workout }),
  update: (id, workout) => apiCall(`/workouts/${id}`, { method: 'PUT', body: workout }),
  delete: (id) => apiCall(`/workouts/${id}`, { method: 'DELETE' }),
}

export const healthCheck = () => apiCall('/health')

