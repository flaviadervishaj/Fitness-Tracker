import React from 'react'
import './Dashboard.css'

function Dashboard({ workouts }) {
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
    { label: 'Total Workouts', value: totalWorkouts, icon: '📊', color: '#0f4c75' },
    { label: 'This Week', value: thisWeekWorkouts, icon: '📅', color: '#3282b8' },
    { label: 'Exercises Done', value: totalExercises, icon: '💪', color: '#ff6b9d' },
    { label: 'Total Minutes', value: totalDuration, icon: '⏱️', color: '#bbe1fa' },
  ]

  const recentWorkouts = workouts.slice(-5).reverse()

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome to Your Fitness Journey! 🏋️</h1>
      <p className="dashboard-subtitle">Track your progress and achieve your goals</p>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Recent Workouts</h2>
        {recentWorkouts.length > 0 ? (
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
            <p>No workouts yet. Start your first workout to see it here!</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/workout" className="action-btn primary">
            ➕ Start New Workout
          </a>
          <a href="/exercises" className="action-btn secondary">
            📚 Browse Exercises
          </a>
          <a href="/progress" className="action-btn secondary">
            📈 View Progress
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard




