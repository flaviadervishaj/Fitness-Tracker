import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import WorkoutTracker from './components/WorkoutTracker'
import ExerciseLibrary from './components/ExerciseLibrary'
import Progress from './components/Progress'
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
  const [exercises] = useState([
    { id: 1, name: 'Push-ups', category: 'Chest', muscle: 'Chest, Triceps', description: 'Classic bodyweight exercise for upper body strength', image: '💪' },
    { id: 2, name: 'Squats', category: 'Legs', muscle: 'Quadriceps, Glutes', description: 'Fundamental lower body exercise', image: '🦵' },
    { id: 3, name: 'Pull-ups', category: 'Back', muscle: 'Lats, Biceps', description: 'Upper body pulling exercise', image: '🏋️' },
    { id: 4, name: 'Deadlifts', category: 'Back', muscle: 'Hamstrings, Glutes, Back', description: 'Compound movement for posterior chain', image: '⚡' },
    { id: 5, name: 'Bench Press', category: 'Chest', muscle: 'Chest, Shoulders, Triceps', description: 'Classic chest building exercise', image: '🏆' },
    { id: 6, name: 'Plank', category: 'Core', muscle: 'Abs, Core', description: 'Isometric core strengthening exercise', image: '🛑' },
    { id: 7, name: 'Lunges', category: 'Legs', muscle: 'Quadriceps, Glutes', description: 'Unilateral leg exercise', image: '🚶' },
    { id: 8, name: 'Shoulder Press', category: 'Shoulders', muscle: 'Deltoids, Triceps', description: 'Overhead pressing movement', image: '⬆️' },
  ])

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard workouts={workouts} />} />
            <Route 
              path="/workout" 
              element={<WorkoutTracker workouts={workouts} setWorkouts={setWorkouts} exercises={exercises} />} 
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
