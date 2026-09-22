import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const result = isRegister
      ? await register(username.trim(), email.trim(), password)
      : await login(username.trim(), password)

    setSubmitting(false)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>💪 Fitness Tracker</h1>
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {isRegister ? 'Sign up to start tracking your fitness journey' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="login-switch">
          <p>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button"
              className="switch-btn"
              onClick={() => setIsRegister((current) => !current)}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
