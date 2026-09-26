import React from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard({ workouts, loading }) {
  const totalWorkouts = workouts.length
  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return workoutDate >= weekAgo
  }).length

  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0)
  const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0)

  const stats = [
    { label: 'Total Workouts', value: totalWorkouts, color: '#00bfff' },
    { label: 'This Week', value: thisWeekWorkouts, color: '#0096ff' },
    { label: 'Exercises Done', value: totalExercises, color: '#40e0d0' },
    { label: 'Total Minutes', value: totalDuration, color: '#00ced1' },
  ]

  const recentWorkouts = workouts.slice(0, 3)

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Your workout overview</h1>
      <p className="dashboard-subtitle">Your activity at a glance</p>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section recent-workouts-section">
          <h2>Recent Workouts</h2>
          {loading ? (
            <div className="empty-state"><p>Loading workouts...</p></div>
          ) : recentWorkouts.length > 0 ? (
            <div className="workout-list">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="workout-card">
                  <div className="workout-header">
                    <h3>{workout.name}</h3>
                    <span className="workout-date">{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                  <div className="workout-details">
                    <span>{workout.exercises.length} exercises</span>
                    {workout.duration && <span>{workout.duration} minutes</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No workouts yet. Start your first workout to see it here.</p>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/workout" className="action-btn primary">
              Start New Workout
            </Link>
            <Link to="/" className="action-btn secondary">
              Browse Exercises
            </Link>
            <Link to="/progress" className="action-btn secondary">
              View Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
