// Use relative URL in development (Vite proxy) or absolute URL in production
const API_BASE_URL = import.meta.env.PROD ? 'http://localhost:5000/api' : '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Exercise API
export const exerciseAPI = {
  getAll: () => apiCall('/exercises'),
  getById: (id) => apiCall(`/exercises/${id}`),
  create: (exercise) => apiCall('/exercises', {
    method: 'POST',
    body: exercise,
  }),
};

// Workout API
export const workoutAPI = {
  getAll: () => apiCall('/workouts'),
  getById: (id) => apiCall(`/workouts/${id}`),
  create: (workout) => apiCall('/workouts', {
    method: 'POST',
    body: workout,
  }),
  update: (id, workout) => apiCall(`/workouts/${id}`, {
    method: 'PUT',
    body: workout,
  }),
  delete: (id) => apiCall(`/workouts/${id}`, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = () => apiCall('/health');
