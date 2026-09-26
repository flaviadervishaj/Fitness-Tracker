const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const getAuthToken = () => localStorage.getItem('token')

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
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
    response = await fetch(url, config)
  } catch {
    throw new Error('Unable to connect to the server. Please try again.')
  }

  const contentType = response.headers.get('content-type') || ''

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    throw new Error('Authentication required')
  }

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API error: ${response.status}`)
    }
    throw new Error(`Server request failed (${response.status}). Please try again.`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error('The server returned an unexpected response. Please try again.')
  }

  return response.json()
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
