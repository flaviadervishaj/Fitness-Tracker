import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from './ToastContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const AuthContext = createContext()

const clearStoredSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    let isCurrent = true

    const restoreSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Invalid session')

        const currentUser = await response.json()
        if (isCurrent) {
          localStorage.setItem('user', JSON.stringify(currentUser))
          setUser(currentUser)
        }
      } catch {
        clearStoredSession()
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      isCurrent = false
    }
  }, [])

  const submitAuthRequest = async (endpoint, payload, successMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(successMessage)
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Authentication failed')
      return { success: false, error: error.message }
    }
  }

  const login = (username, password) => (
    submitAuthRequest('login', { username, password }, 'Welcome back!')
  )

  const register = (username, email, password) => (
    submitAuthRequest('register', { username, email, password }, 'Account created successfully!')
  )

  const logout = () => {
    clearStoredSession()
    setUser(null)
    toast.info('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

