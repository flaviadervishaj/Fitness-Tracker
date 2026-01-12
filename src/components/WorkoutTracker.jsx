import React, { useState } from 'react'
import './WorkoutTracker.css'

function WorkoutTracker({ workouts, setWorkouts, exercises }) {
  const [workoutName, setWorkoutName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [duration, setDuration] = useState('')
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [currentExercise, setCurrentExercise] = useState({
    exerciseId: '',
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  })

  const handleAddExercise = () => {
    if (!currentExercise.exerciseId || !currentExercise.sets || !currentExercise.reps) {
      alert('Please fill in exercise, sets, and reps')
      return
    }

    const exercise = exercises.find(e => e.id === parseInt(currentExercise.exerciseId))
    const newExercise = {
      ...currentExercise,
      exerciseId: parseInt(currentExercise.exerciseId),
      exerciseName: exercise.name,
      exerciseImage: exercise.image,
      sets: parseInt(currentExercise.sets),
      reps: parseInt(currentExercise.reps),
      weight: currentExercise.weight ? parseFloat(currentExercise.weight) : null
    }

    setSelectedExercises([...selectedExercises, newExercise])
    setCurrentExercise({
      exerciseId: '',
      sets: '',
      reps: '',
      weight: '',
      notes: ''
    })
    setShowExerciseForm(false)
  }

  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const handleSaveWorkout = () => {
    if (!workoutName || selectedExercises.length === 0) {
      alert('Please provide a workout name and add at least one exercise')
      return
    }

    const newWorkout = {
      id: Date.now(),
      name: workoutName,
      date: new Date().toISOString(),
      exercises: selectedExercises,
      duration: duration ? parseInt(duration) : null
    }

    setWorkouts([...workouts, newWorkout])
    
    // Reset form
    setWorkoutName('')
    setSelectedExercises([])
    setDuration('')
    alert('Workout saved successfully!')
  }

  return (
    <div className="workout-tracker">
      <h1>Track Your Workout 💪</h1>

      <div className="workout-form">
        <div className="form-group">
          <label>Workout Name</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Upper Body, Leg Day, Full Body"
          />
        </div>

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="exercises-section">
          <div className="section-header">
            <h2>Exercises</h2>
            <button 
              className="btn-add"
              onClick={() => setShowExerciseForm(!showExerciseForm)}
            >
              {showExerciseForm ? 'Cancel' : '+ Add Exercise'}
            </button>
          </div>

          {showExerciseForm && (
            <div className="exercise-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Exercise</label>
                  <select
                    value={currentExercise.exerciseId}
                    onChange={(e) => setCurrentExercise({...currentExercise, exerciseId: e.target.value})}
                  >
                    <option value="">Select exercise</option>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise({...currentExercise, sets: e.target.value})}
                    placeholder="3"
                  />
                </div>

                <div className="form-group">
                  <label>Reps</label>
                  <input
                    type="number"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise({...currentExercise, reps: e.target.value})}
                    placeholder="10"
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={currentExercise.weight}
                    onChange={(e) => setCurrentExercise({...currentExercise, weight: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={currentExercise.notes}
                  onChange={(e) => setCurrentExercise({...currentExercise, notes: e.target.value})}
                  placeholder="Optional notes..."
                  rows="2"
                />
              </div>

              <button className="btn-primary" onClick={handleAddExercise}>
                Add to Workout
              </button>
            </div>
          )}

          {selectedExercises.length > 0 && (
            <div className="exercises-list">
              {selectedExercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  {exercise.exerciseImage && (
                    <div className="exercise-item-image">{exercise.exerciseImage}</div>
                  )}
                  <div className="exercise-info">
                    <h3>{exercise.exerciseName}</h3>
                    <div className="exercise-details">
                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                      {exercise.weight && <span>{exercise.weight} kg</span>}
                    </div>
                    {exercise.notes && <p className="exercise-notes">{exercise.notes}</p>}
                  </div>
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-save" onClick={handleSaveWorkout}>
          💾 Save Workout
        </button>
      </div>
    </div>
  )
}

export default WorkoutTracker




