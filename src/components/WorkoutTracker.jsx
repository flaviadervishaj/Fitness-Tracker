import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { workoutAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { getExerciseImage } from '../services/exerciseImages'
import './WorkoutTracker.css'

function WorkoutTracker({ workouts, onWorkoutSaved, exercises = [] }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedExercise = useRef(null)
  const { logout } = useAuth()
  const [workoutName, setWorkoutName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [duration, setDuration] = useState('')
  const [editingWorkoutId, setEditingWorkoutId] = useState(null)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [currentExercise, setCurrentExercise] = useState({
    exerciseId: '',
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  })

  const exercisesList = Array.isArray(exercises) ? exercises : []

  useEffect(() => {
    const exerciseId = Number(searchParams.get('exercise'))
    if (!Number.isInteger(exerciseId) || exerciseId <= 0 || exerciseId === preselectedExercise.current) return
    if (!exercisesList.some((exercise) => exercise.id === exerciseId)) return
    preselectedExercise.current = exerciseId
    setCurrentExercise((current) => ({ ...current, exerciseId: String(exerciseId) }))
    setShowExerciseForm(true)
  }, [searchParams, exercisesList])

  const handleAddExercise = () => {
    if (!currentExercise.exerciseId || !currentExercise.sets || !currentExercise.reps) {
      toast.warning('Please fill in exercise, sets, and reps')
      return
    }

    const sets = Number(currentExercise.sets)
    const reps = Number(currentExercise.reps)
    const weight = currentExercise.weight !== '' ? Number(currentExercise.weight) : null

    if (!Number.isInteger(sets) || !Number.isInteger(reps) || sets <= 0 || reps <= 0) {
      toast.warning('Sets and reps must be positive whole numbers')
      return
    }

    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      toast.warning('Enter a valid weight')
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
      exerciseImage: getExerciseImage(exercise),
      sets: sets,
      reps: reps,
      weight: weight
    }

    setSelectedExercises((selected) => editingExerciseIndex === null
      ? [...selected, newExercise]
      : selected.map((item, index) => index === editingExerciseIndex ? newExercise : item))
    setCurrentExercise({
      exerciseId: '',
      sets: '',
      reps: '',
      weight: '',
      notes: ''
    })
    setShowExerciseForm(false)
    setEditingExerciseIndex(null)
  }

  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
    setEditingExerciseIndex(null)
    setShowExerciseForm(false)
  }

  const resetForm = () => {
    setWorkoutName('')
    setDuration('')
    setSelectedExercises([])
    setEditingWorkoutId(null)
    setEditingExerciseIndex(null)
    setShowExerciseForm(false)
    setCurrentExercise({ exerciseId: '', sets: '', reps: '', weight: '', notes: '' })
  }

  const handleEditWorkout = (workout) => {
    setEditingWorkoutId(workout.id)
    setWorkoutName(workout.name)
    setDuration(workout.duration == null ? '' : String(workout.duration))
    setSelectedExercises(workout.exercises.map((exercise) => ({
      ...exercise,
      exerciseImage: getExerciseImage({ name: exercise.exerciseName, image: exercise.exerciseImage }),
    })))
    setShowExerciseForm(false)
    setEditingExerciseIndex(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteWorkout = async (workout) => {
    if (!window.confirm(`Delete "${workout.name}"? This cannot be undone.`)) return
    setDeletingWorkoutId(workout.id)
    try {
      await workoutAPI.delete(workout.id)
      if (editingWorkoutId === workout.id) resetForm()
      if (onWorkoutSaved) await onWorkoutSaved()
      toast.success('Workout deleted')
    } catch (error) {
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login')
      } else {
        toast.error(error.message || 'Could not delete workout')
      }
    } finally {
      setDeletingWorkoutId(null)
    }
  }

  const handleSaveWorkout = async () => {
    if (saving) return
    if (!workoutName.trim() || selectedExercises.length === 0) {
      toast.warning('Please provide a workout name and add at least one exercise')
      return
    }

    try {
      setSaving(true)
      const workoutDuration = duration !== '' ? Number(duration) : null
      if (workoutDuration !== null && (!Number.isInteger(workoutDuration) || workoutDuration < 0)) {
        toast.warning('Enter a valid duration')
        return
      }

      const newWorkout = {
        name: workoutName.trim(),
        ...(!editingWorkoutId && { date: new Date().toISOString() }),
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? null,
          notes: ex.notes || ''
        })),
        duration: workoutDuration
      }

      if (editingWorkoutId) {
        await workoutAPI.update(editingWorkoutId, newWorkout)
      } else {
        await workoutAPI.create(newWorkout)
      }

      const wasEditing = editingWorkoutId !== null
      resetForm()
      
      if (onWorkoutSaved) await onWorkoutSaved()
      
      toast.success(wasEditing ? 'Workout updated' : 'Workout saved')
    } catch (error) {
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login')
        toast.error('Session expired. Please login again.')
      } else {
        toast.error(`Failed to save workout: ${error.message || 'Please try again.'}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workout-tracker">
      <h1>{editingWorkoutId ? 'Edit Workout' : 'Track Your Workout'}</h1>
      <a className="history-jump" href="#workout-history-title">View workout history</a>

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
            <button type="button"
              className="btn-add"
              onClick={() => {
                setShowExerciseForm(!showExerciseForm)
                setEditingExerciseIndex(null)
                setCurrentExercise({ exerciseId: '', sets: '', reps: '', weight: '', notes: '' })
              }}
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

              <button type="button" className="btn-primary" onClick={handleAddExercise}>
                {editingExerciseIndex === null ? 'Add to Workout' : 'Update Exercise'}
              </button>
            </div>
          )}

          {selectedExercises.length > 0 && (
            <div className="exercises-list">
              {selectedExercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  {exercise.exerciseImage && (
                    <div className="exercise-item-image">
                      {exercise.exerciseImage.startsWith('http') || exercise.exerciseImage.startsWith('/') ? (
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
                      {exercise.weight != null && <span>{exercise.weight} kg</span>}
                    </div>
                    {exercise.notes && <p className="exercise-notes">{exercise.notes}</p>}
                  </div>
                  <button type="button" className="btn-edit-exercise" onClick={() => {
                    setEditingExerciseIndex(index)
                    setCurrentExercise({
                      exerciseId: String(exercise.exerciseId),
                      sets: String(exercise.sets),
                      reps: String(exercise.reps),
                      weight: exercise.weight == null ? '' : String(exercise.weight),
                      notes: exercise.notes || '',
                    })
                    setShowExerciseForm(true)
                  }}>Edit</button>
                  <button type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveExercise(index)}
                    aria-label={`Remove ${exercise.exerciseName}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="btn-save" onClick={handleSaveWorkout} disabled={saving}>
          {saving ? 'Saving...' : editingWorkoutId ? 'Update Workout' : 'Save Workout'}
        </button>
        {editingWorkoutId && <button type="button" className="btn-cancel-edit" onClick={resetForm}>Cancel editing</button>}
      </div>

      <section className="workout-history" aria-labelledby="workout-history-title">
        <h2 id="workout-history-title">Workout History</h2>
        {workouts.length === 0 ? <p>No workouts saved yet.</p> : workouts.map((workout) => (
          <article key={workout.id} className="history-card">
            <div className="history-card-main">
              <div>
                <h3>{workout.name}</h3>
                <p>{new Date(workout.date).toLocaleDateString()} · {workout.exercises.length} exercises{workout.duration != null ? ` · ${workout.duration} min` : ''}</p>
                <p className="history-exercises">{workout.exercises.map((exercise) => exercise.exerciseName).join(', ')}</p>
              </div>
              <div className="history-actions">
                <button type="button" onClick={() => handleEditWorkout(workout)}>Edit</button>
                <button type="button" className="history-delete" disabled={deletingWorkoutId === workout.id} onClick={() => handleDeleteWorkout(workout)}>
                  {deletingWorkoutId === workout.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default WorkoutTracker
