import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { passwordResetAPI } from '../services/api'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recoveryAvailable, setRecoveryAvailable] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    passwordResetAPI.available().then((data) => setRecoveryAvailable(data.available)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = isRegister
        ? await register(username, email.trim() || undefined, password)
        : await login(username, password)
      if (result.success) {
        const exerciseId = Number(searchParams.get('exercise'))
        navigate(Number.isInteger(exerciseId) && exerciseId > 0 ? `/workout?exercise=${exerciseId}` : '/dashboard')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Fitness Tracker</h1>
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {isRegister ? 'Sign up to start tracking your fitness journey' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-username">{isRegister ? 'Username' : 'Username or email'}</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRegister ? 'Enter your username' : 'Enter your username or email'}
              autoComplete="username"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="register-email">Email{recoveryAvailable ? '' : ' (Optional)'}</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required={recoveryAvailable}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {!isRegister && recoveryAvailable && (
          <Link to="/forgot-password" className="login-back-link">Forgot password?</Link>
        )}

        <div className="login-switch">
          <p>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button"
              className="switch-btn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
        <Link to="/" className="login-back-link">← Back to home</Link>
      </div>
    </div>
  )
}

export default Login
