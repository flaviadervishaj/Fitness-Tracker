import React from 'react'
import './Progress.css'

function Progress({ workouts }) {
  const getWeeklyStats = () => {
    const weeks = {}
    workouts.forEach(workout => {
      const date = new Date(workout.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          workouts: 0,
          exercises: 0,
          duration: 0
        }
      }
      
      weeks[weekKey].workouts++
      weeks[weekKey].exercises += workout.exercises.length
      weeks[weekKey].duration += workout.duration || 0
    })
    
    return Object.entries(weeks)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 8)
      .map(([date, stats]) => ({ date, ...stats }))
  }

  const weeklyStats = getWeeklyStats()

  const getMostUsedExercises = () => {
    const exerciseCount = {}
    workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        const name = ex.exerciseName
        exerciseCount[name] = (exerciseCount[name] || 0) + 1
      })
    })
    
    return Object.entries(exerciseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  const mostUsedExercises = getMostUsedExercises()

  const totalWorkouts = workouts.length
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0)
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
  const avgWorkoutDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  return (
    <div className="progress">
      <h1>Your Progress 📈</h1>
      <p className="progress-subtitle">Track your fitness journey and achievements</p>

      <div className="progress-stats">
        <div className="progress-stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-info">
            <div className="stat-number">{totalWorkouts}</div>
            <div className="stat-text">Total Workouts</div>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-info">
            <div className="stat-number">{totalExercises}</div>
            <div className="stat-text">Exercises Completed</div>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-number">{totalDuration}</div>
            <div className="stat-text">Total Minutes</div>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{avgWorkoutDuration}</div>
            <div className="stat-text">Avg Duration (min)</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Weekly Activity</h2>
        {weeklyStats.length > 0 ? (
          <div className="weekly-chart">
            {weeklyStats.map((week, index) => (
              <div key={index} className="week-bar-container">
                <div className="week-label">
                  {new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="week-bars">
                  <div className="bar-group">
                    <div 
                      className="bar workouts-bar"
                      style={{ height: `${(week.workouts / Math.max(...weeklyStats.map(w => w.workouts))) * 100}%` }}
                      title={`${week.workouts} workouts`}
                    ></div>
                    <span className="bar-label">Workouts</span>
                  </div>
                  <div className="bar-group">
                    <div 
                      className="bar exercises-bar"
                      style={{ height: `${(week.exercises / Math.max(...weeklyStats.map(w => w.exercises))) * 100}%` }}
                      title={`${week.exercises} exercises`}
                    ></div>
                    <span className="bar-label">Exercises</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No workout data yet. Start logging workouts to see your progress!</p>
          </div>
        )}
      </div>

      {mostUsedExercises.length > 0 && (
        <div className="progress-section">
          <h2>Most Used Exercises</h2>
          <div className="exercise-stats">
            {mostUsedExercises.map((exercise, index) => (
              <div key={index} className="exercise-stat-item">
                <div className="exercise-rank">#{index + 1}</div>
                <div className="exercise-name">{exercise.name}</div>
                <div className="exercise-count">{exercise.count} times</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <div className="empty-state-large">
          <div className="empty-icon">📊</div>
          <h3>No Progress Data Yet</h3>
          <p>Start tracking your workouts to see your progress here!</p>
        </div>
      )}
    </div>
  )
}

export default Progress




