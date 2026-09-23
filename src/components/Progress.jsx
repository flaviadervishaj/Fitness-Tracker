import React from 'react'
import './Progress.css'

function Progress({ workouts }) {
  const getWeeklyStats = () => {
    const days = {}
    workouts.forEach(workout => {
      const date = new Date(workout.date)
      // Get just the date part (without time)
      const dateKey = date.toISOString().split('T')[0]
      
      if (!days[dateKey]) {
        days[dateKey] = {
          date: dateKey,
          workouts: 0,
          exercises: 0,
          duration: 0
        }
      }
      
      days[dateKey].workouts++
      days[dateKey].exercises += workout.exercises.length
      days[dateKey].duration += workout.duration || 0
    })
    
    // Sort by date descending and take last 14 days
    const sortedDays = Object.values(days)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 14)
    
    return sortedDays
  }

  const dailyStats = getWeeklyStats() // Returns daily stats (last 14 days)

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
        <h2>Daily Activity (Last 14 Days)</h2>
        {dailyStats.length > 0 ? (
          <div className="weekly-chart-container">
            <div className="chart-labels">
              <span className="chart-label">Workouts</span>
              <span className="chart-label">Exercises</span>
            </div>
            <div className="weekly-chart">
              {dailyStats.map((day, index) => {
                const maxWorkouts = Math.max(...dailyStats.map(d => d.workouts), 1)
                const maxExercises = Math.max(...dailyStats.map(d => d.exercises), 1)
                const workoutHeight = maxWorkouts > 0 ? (day.workouts / maxWorkouts) * 100 : 0
                const exerciseHeight = maxExercises > 0 ? (day.exercises / maxExercises) * 100 : 0
                
                return (
                  <div key={index} className="week-bar-container">
                    <div className="week-bars">
                      <div className="bar-group">
                        <div 
                          className="bar workouts-bar"
                          style={{ 
                            height: `${workoutHeight}%`,
                            minHeight: workoutHeight > 0 ? '15px' : '0'
                          }}
                          title={`${day.workouts} workouts`}
                        >
                          {day.workouts > 0 && <span className="bar-value">{day.workouts}</span>}
                        </div>
                      </div>
                      <div className="bar-group">
                        <div 
                          className="bar exercises-bar"
                          style={{ 
                            height: `${exerciseHeight}%`,
                            minHeight: exerciseHeight > 0 ? '15px' : '0'
                          }}
                          title={`${day.exercises} exercises`}
                        >
                          {day.exercises > 0 && <span className="bar-value">{day.exercises}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="week-label">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
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




