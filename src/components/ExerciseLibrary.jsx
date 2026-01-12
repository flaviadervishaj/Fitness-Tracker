import React, { useState } from 'react'
import './ExerciseLibrary.css'

function ExerciseLibrary({ exercises }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', ...new Set(exercises.map(ex => ex.category))]

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="exercise-library">
      <h1>Exercise Library 📚</h1>
      <p className="library-subtitle">Browse and learn about different exercises</p>

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
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            {exercise.image && (
              <div className="exercise-card-image">{exercise.image}</div>
            )}
            <div className="exercise-card-header">
              <h3>{exercise.name}</h3>
              <span className="exercise-category">{exercise.category}</span>
            </div>
            <div className="exercise-card-body">
              <div className="exercise-muscle">
                <strong>Target Muscles:</strong> {exercise.muscle}
              </div>
              <p className="exercise-description">{exercise.description}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="no-results">
          <p>No exercises found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default ExerciseLibrary

