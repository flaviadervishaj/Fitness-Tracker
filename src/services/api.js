// Use environment variable for production, or proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const getAuthToken = () => localStorage.getItem('token')

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type') || ''
    
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw new Error('Authentication required')
    }
    
    if (!response.ok) {
      // Try to parse as JSON first
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      } else {
        // If not JSON, read as text to see what we got
        const text = await response.text()
        throw new Error(`API returned non-JSON response (${response.status}). Check if VITE_API_URL is configured correctly. URL: ${url}. Response: ${text.substring(0, 100)}`)
      }
    }
    
    // Check if response is JSON before parsing
    if (!contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`API returned non-JSON response. Check if VITE_API_URL is configured correctly. URL: ${url}. Response: ${text.substring(0, 100)}`)
    }
    
    return await response.json()
  } catch (error) {
    // If it's already our custom error, throw it
    if (error.message.includes('VITE_API_URL') || error.message.includes('non-JSON')) {
      throw error
    }
    // Otherwise, wrap it with more context
    throw new Error(`API call failed: ${error.message}. URL: ${url}`)
  }
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

