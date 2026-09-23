import React, { useState, useEffect, useRef } from 'react'
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

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          💪 Fitness Tracker
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/workout" className={isActive('/workout') ? 'active' : ''}>
            Workout
          </Link>
          <Link to="/exercises" className={isActive('/exercises') ? 'active' : ''}>
            Exercises
          </Link>
          <Link to="/progress" className={isActive('/progress') ? 'active' : ''}>
            Progress
          </Link>
          <div className="user-menu">
            <span className="username">{user.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
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
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const { user, loading: authLoading, logout } = useAuth()
  const toast = useToast()
  const fetchedUserIdRef = useRef(null)

  useEffect(() => {
    if (!user) {
      setExercises([])
      setWorkouts([])
      setLoading(false)
      fetchedUserIdRef.current = null
    }
  }, [user])

  useEffect(() => {
    if (authLoading || !user) {
      if (!user && !authLoading) setLoading(false)
      return
    }

    if (fetchedUserIdRef.current === user.id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        fetchedUserIdRef.current = user.id
        
        const handleAuthError = (err) => {
          if (err.message === 'Authentication required') {
            logout()
            setShouldRedirect(true)
            toast.error('Session expired. Please login again.')
          }
          return []
        }
        
        const [exercisesData, workoutsData] = await Promise.all([
          exerciseAPI.getAll().catch(handleAuthError),
          workoutAPI.getAll().catch(handleAuthError)
        ])
        
        setExercises(Array.isArray(exercisesData) ? exercisesData : [])
        setWorkouts(Array.isArray(workoutsData) ? workoutsData : [])
        
        if ((!exercisesData || exercisesData.length === 0) && (!workoutsData || workoutsData.length === 0)) {
          toast.error('Failed to load data. Make sure the backend server is running.')
        } else if (!exercisesData || exercisesData.length === 0) {
          toast.warning('Failed to load exercises. Please refresh the page.')
        } else if (!workoutsData || workoutsData.length === 0) {
          toast.warning('Failed to load workouts. Please refresh the page.')
        }
      } catch (err) {
        toast.error('Failed to load data. Make sure the backend server is running.')
        setExercises([])
        setWorkouts([])
        fetchedUserIdRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading])

  const refreshWorkouts = async () => {
    try {
      const workoutsData = await workoutAPI.getAll()
      setWorkouts(workoutsData)
    } catch (err) {
      if (err.message === 'Authentication required') {
        logout()
        setShouldRedirect(true)
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to refresh workouts')
      }
    }
  }

  if (shouldRedirect) return <Navigate to="/login" replace />
  if (authLoading || (user && loading)) {
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
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard workouts={workouts} />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <ExerciseLibrary exercises={exercises} />
                </ProtectedRoute>
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
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
