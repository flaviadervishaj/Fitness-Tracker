import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import './WorkoutTracker.css'

function WorkoutTracker({ workouts, onWorkoutSaved, exercises = [] }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { logout } = useAuth()
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

  const exercisesList = Array.isArray(exercises) ? exercises : []

  const handleAddExercise = () => {
    if (!currentExercise.exerciseId || !currentExercise.sets || !currentExercise.reps) {
      toast.warning('Please fill in exercise, sets, and reps')
      return
    }

    const sets = parseInt(currentExercise.sets)
    const reps = parseInt(currentExercise.reps)
    const weight = currentExercise.weight ? parseFloat(currentExercise.weight) : null

    if (sets <= 0 || reps <= 0) {
      toast.warning('Sets and reps must be greater than 0')
      return
    }

    if (weight !== null && weight < 0) {
      toast.warning('Weight cannot be negative')
      return
    }

    const exercise = exercisesList.find(e => e.id === parseInt(currentExercise.exerciseId))
    if (!exercise) {
      toast.error('Exercise not found')
      return
    }

    const newExercise = {
      ...currentExercise,
      exerciseId: parseInt(currentExercise.exerciseId),
      exerciseName: exercise.name,
      exerciseImage: exercise.image,
      sets: sets,
      reps: reps,
      weight: weight
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

  const handleSaveWorkout = async () => {
    if (!workoutName || selectedExercises.length === 0) {
      toast.warning('Please provide a workout name and add at least one exercise')
      return
    }

    try {
      const workoutDuration = duration ? parseInt(duration) : null
      if (workoutDuration !== null && workoutDuration < 0) {
        toast.warning('Duration cannot be negative')
        return
      }

      const newWorkout = {
        name: workoutName.trim(),
        date: new Date().toISOString(),
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || null,
          notes: ex.notes || ''
        })),
        duration: workoutDuration
      }

      await workoutAPI.create(newWorkout)
      
      setWorkoutName('')
      setSelectedExercises([])
      setDuration('')
      setShowExerciseForm(false)
      
      if (onWorkoutSaved) await onWorkoutSaved()
      
      toast.success('Workout saved successfully!')
    } catch (error) {
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error(`Failed to save workout: ${error.message || 'Please try again.'}`)
      }
    }
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
                    {exercisesList.length > 0 ? (
                      exercisesList.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No exercises available. Please check the Exercise Library.</option>
                    )}
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
                    <div className="exercise-item-image">
                      {exercise.exerciseImage.startsWith('http') ? (
                        <img src={exercise.exerciseImage} alt={exercise.exerciseName} />
                      ) : (
                        <span>{exercise.exerciseImage}</span>
                      )}
                    </div>
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
