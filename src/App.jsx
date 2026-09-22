import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
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

  if (!user) return null

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/workout', label: 'Workout' },
    { path: '/exercises', label: 'Exercises' },
    { path: '/progress', label: 'Progress' },
  ]

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="logo">💪 Fitness Tracker</Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
          <div className="user-menu">
            <span className="username">{user.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-container" role="status">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  return user ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading, logout } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setExercises([])
      setWorkouts([])
      setLoading(false)
      return
    }

    let isCurrent = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const [exerciseData, workoutData] = await Promise.all([
          exerciseAPI.getAll(),
          workoutAPI.getAll(),
        ])

        if (isCurrent) {
          setExercises(Array.isArray(exerciseData) ? exerciseData : [])
          setWorkouts(Array.isArray(workoutData) ? workoutData : [])
        }
      } catch (error) {
        if (!isCurrent) return

        if (error.code === 'AUTH_REQUIRED') {
          logout()
          toast.error('Your session expired. Please sign in again.')
        } else {
          toast.error('Unable to load your fitness data. Please try again.')
        }

        setExercises([])
        setWorkouts([])
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isCurrent = false
    }
  }, [user?.id, authLoading])

  const refreshWorkouts = async () => {
    try {
      setWorkouts(await workoutAPI.getAll())
    } catch (error) {
      if (error.code === 'AUTH_REQUIRED') {
        logout()
        toast.error('Your session expired. Please sign in again.')
      } else {
        toast.error('Unable to refresh workouts.')
      }
    }
  }

  if (authLoading || (user && loading)) {
    return <LoadingState message="Loading your fitness data..." />
  }

  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <Dashboard workouts={workouts} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/workout"
            element={(
              <ProtectedRoute>
                <WorkoutTracker
                  onWorkoutSaved={refreshWorkouts}
                  exercises={exercises}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/exercises"
            element={(
              <ProtectedRoute>
                <ExerciseLibrary exercises={exercises} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/progress"
            element={(
              <ProtectedRoute>
                <Progress workouts={workouts} />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
