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
              <div className="exercise-card-image">
                {exercise.image.startsWith('http') ? (
                  <img 
                    src={exercise.image} 
                    alt={exercise.name}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="48"%3E💪%3C/text%3E%3C/svg%3E'
                    }}
                  />
                ) : (
                  <span>{exercise.image}</span>
                )}
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

