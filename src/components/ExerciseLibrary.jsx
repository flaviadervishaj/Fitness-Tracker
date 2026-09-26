import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getExerciseImage } from '../services/exerciseImages'
import { getExerciseGuide } from '../data/exerciseGuides'
import './ExerciseLibrary.css'

function ExerciseLibrary({ exercises, loading, error, onRetry }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  const categories = ['All', ...new Set(exercises.map(ex => ex.category))]

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="exercise-library">
      <h1>Exercise Library</h1>
      <p className="library-subtitle">Find an exercise, learn the movement, and add it to your workout.</p>

      <div className="library-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="exercises-grid">
        {filteredExercises.map(exercise => {
          const image = getExerciseImage(exercise)
          const guide = getExerciseGuide(exercise.name)
          return <div key={exercise.id} className="exercise-card">
            {image && (
              <div className="exercise-card-image">
                  <img
                    src={image}
                    alt={exercise.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
              </div>
            )}
            <div className="exercise-card-header">
              <h3>{exercise.name}</h3>
              <span className="exercise-category">{exercise.category}</span>
            </div>
            <div className="exercise-card-body">
              <div className="exercise-muscle">
                <strong>Target Muscles:</strong> {exercise.muscle}
              </div>
              {guide ? (
                <div className="exercise-guide">
                  <h4>How to do it</h4>
                  <ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <a href={guide.source} target="_blank" rel="noopener noreferrer">Full technique guide</a>
                </div>
              ) : <p className="exercise-description">{exercise.description}</p>}
            </div>
            <Link
              className="exercise-add"
              to={user ? `/workout?exercise=${exercise.id}` : `/login?exercise=${exercise.id}`}
            >
              {user ? 'Add to workout' : 'Sign in to add'}
            </Link>
          </div>
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="no-results">
          <p>{loading ? 'Loading exercises…' : error ? 'Exercises could not be loaded. Please try again later.' : 'No exercises found matching your search.'}</p>
          {error && !loading && <button type="button" className="category-btn" onClick={onRetry}>Try again</button>}
        </div>
      )}
    </div>
  )
}

export default ExerciseLibrary
