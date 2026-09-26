import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import WorkoutTracker from './components/WorkoutTracker'
import ExerciseLibrary from './components/ExerciseLibrary'
import Progress from './components/Progress'
import Login from './components/Login'
import { exerciseAPI, workoutAPI } from './services/api'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function Navigation() {
  const location = useLocation()
  const { user, logout } = useAuth()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          Fitness Tracker
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Dashboard
          </Link>
          {user && <Link to="/workout" className={isActive('/workout') ? 'active' : ''}>
            Workout
          </Link>}
          <Link to="/exercises" className={isActive('/exercises') ? 'active' : ''}>
            Exercises
          </Link>
          {user && <Link to="/progress" className={isActive('/progress') ? 'active' : ''}>
            Progress
          </Link>}
          {user ? (
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [exercisesLoading, setExercisesLoading] = useState(true)
  const [exercisesError, setExercisesError] = useState(false)
  const [exerciseRequestKey, setExerciseRequestKey] = useState(0)
  const { user, loading: authLoading, logout } = useAuth()
  const toast = useToast()

  useEffect(() => {
    let active = true
    setExercisesLoading(true)
    setExercisesError(false)
    exerciseAPI.getAll()
      .then((data) => {
        if (active) setExercises(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setExercisesError(true)
      })
      .finally(() => {
        if (active) setExercisesLoading(false)
      })
    return () => { active = false }
  }, [exerciseRequestKey])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setWorkouts([])
      setLoading(false)
      return
    }

    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const workoutsData = await workoutAPI.getAll()
        if (!active) return
        setWorkouts(Array.isArray(workoutsData) ? workoutsData : [])
      } catch (err) {
        if (!active) return
        if (err.message === 'Authentication required') {
          logout()
          toast.error('Session expired. Please login again.')
        } else {
          toast.error('Failed to load workouts. Please refresh and try again.')
        }
        setWorkouts([])
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading])

  const refreshWorkouts = async () => {
    try {
      const workoutsData = await workoutAPI.getAll()
      setWorkouts(workoutsData)
    } catch (err) {
      if (err.message === 'Authentication required') {
        logout()
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to refresh workouts')
      }
    }
  }

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <Dashboard workouts={workouts} isGuest={!user} loading={loading} />
              } 
            />
            <Route 
              path="/workout" 
              element={
                <ProtectedRoute>
                  <WorkoutTracker 
                    workouts={workouts} 
                    onWorkoutSaved={refreshWorkouts}
                    exercises={exercises} 
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exercises" 
              element={
                <ExerciseLibrary
                  exercises={exercises}
                  loading={exercisesLoading}
                  error={exercisesError}
                  onRetry={() => setExerciseRequestKey((key) => key + 1)}
                />
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <Progress workouts={workouts} />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
