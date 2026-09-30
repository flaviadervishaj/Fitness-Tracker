import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { passwordResetAPI } from '../services/api'
import './Login.css'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await passwordResetAPI.request(email)
      setMessage(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Fitness Tracker</h1>
        <h2>Reset your password</h2>
        <p className="login-subtitle">Enter the email address you used when creating your account.</p>
        {message ? <p role="status">{message}</p> : (
          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            {error && <p role="alert">{error}</p>}
            <button className="login-btn" disabled={submitting}>{submitting ? 'Please wait…' : 'Send reset link'}</button>
          </form>
        )}
        <Link to="/login" className="login-back-link">Back to sign in</Link>
      </div>
    </div>
  )
}

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await passwordResetAPI.confirm(token, password)
      setMessage(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Fitness Tracker</h1>
        <h2>Choose a new password</h2>
        {!token ? <p role="alert">This reset link is invalid. Request a new one.</p> : message ? <p role="status">{message}</p> : (
          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </div>
            {error && <p role="alert">{error}</p>}
            <button className="login-btn" disabled={submitting}>{submitting ? 'Please wait…' : 'Save new password'}</button>
          </form>
        )}
        <Link to="/login" className="login-back-link">Back to sign in</Link>
      </div>
    </div>
  )
}
