import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import WorkoutTracker from './components/WorkoutTracker'
import ExerciseLibrary from './components/ExerciseLibrary'
import Progress from './components/Progress'
import { exerciseAPI, workoutAPI } from './services/api'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

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
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch exercises and workouts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [exercisesData, workoutsData] = await Promise.all([
          exerciseAPI.getAll(),
          workoutAPI.getAll()
        ])
        setExercises(exercisesData)
        setWorkouts(workoutsData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data. Make sure the backend server is running on http://localhost:5000')
        // Fallback to empty arrays
        setExercises([])
        setWorkouts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to refresh workouts after creating a new one
  const refreshWorkouts = async () => {
    try {
      const workoutsData = await workoutAPI.getAll()
      setWorkouts(workoutsData)
    } catch (err) {
      console.error('Failed to refresh workouts:', err)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Navigation />
        {error && (
          <div style={{ 
            background: '#ff6b6b', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center',
            margin: '10px'
          }}>
            {error}
          </div>
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard workouts={workouts} />} />
            <Route 
              path="/workout" 
              element={
                <WorkoutTracker 
                  workouts={workouts} 
                  onWorkoutSaved={refreshWorkouts}
                  exercises={exercises} 
                />} 
            />
            <Route path="/exercises" element={<ExerciseLibrary exercises={exercises} />} />
            <Route path="/progress" element={<Progress workouts={workouts} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
