// The public backend is shared by the production site and preview deployments.
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'https://fitness-tracker-tkiq.onrender.com/api'
)
