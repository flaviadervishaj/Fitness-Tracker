from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:155155@localhost:5432/fitness_tracker')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)  # Enable CORS for React frontend

# Import models and initialize db
from models import db, Exercise, Workout, WorkoutExercise
db.init_app(app)

# Initialize database
def init_database():
    """Initialize database tables and seed data"""
    with app.app_context():
        db.create_all()
        # Seed initial exercises if database is empty
        if Exercise.query.count() == 0:
            seed_exercises()

def seed_exercises():
    """Seed the database with initial exercises"""
    with app.app_context():
        exercises_data = [
            {'name': 'Push-ups', 'category': 'Chest', 'muscle': 'Chest, Triceps', 
             'description': 'Classic bodyweight exercise for upper body strength', 'image': '💪'},
            {'name': 'Squats', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Fundamental lower body exercise', 'image': '🦵'},
            {'name': 'Pull-ups', 'category': 'Back', 'muscle': 'Lats, Biceps', 
             'description': 'Upper body pulling exercise', 'image': '🏋️'},
            {'name': 'Deadlifts', 'category': 'Back', 'muscle': 'Hamstrings, Glutes, Back', 
             'description': 'Compound movement for posterior chain', 'image': '⚡'},
            {'name': 'Bench Press', 'category': 'Chest', 'muscle': 'Chest, Shoulders, Triceps', 
             'description': 'Classic chest building exercise', 'image': '🏆'},
            {'name': 'Plank', 'category': 'Core', 'muscle': 'Abs, Core', 
             'description': 'Isometric core strengthening exercise', 'image': '🛑'},
            {'name': 'Lunges', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Unilateral leg exercise', 'image': '🚶'},
            {'name': 'Shoulder Press', 'category': 'Shoulders', 'muscle': 'Deltoids, Triceps', 
             'description': 'Overhead pressing movement', 'image': '⬆️'},
        ]
        
        for ex_data in exercises_data:
            exercise = Exercise(**ex_data)
            db.session.add(exercise)
        
        db.session.commit()

# Exercise endpoints
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    """Get all exercises"""
    exercises = Exercise.query.all()
    return jsonify([{
        'id': ex.id,
        'name': ex.name,
        'category': ex.category,
        'muscle': ex.muscle,
        'description': ex.description,
        'image': ex.image
    } for ex in exercises])

@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    """Get a specific exercise"""
    exercise = Exercise.query.get_or_404(exercise_id)
    return jsonify({
        'id': exercise.id,
        'name': exercise.name,
        'category': exercise.category,
        'muscle': exercise.muscle,
        'description': exercise.description,
        'image': exercise.image
    })

@app.route('/api/exercises', methods=['POST'])
def create_exercise():
    """Create a new exercise"""
    data = request.json
    exercise = Exercise(
        name=data['name'],
        category=data.get('category', 'Other'),
        muscle=data.get('muscle', ''),
        description=data.get('description', ''),
        image=data.get('image', '💪')
    )
    db.session.add(exercise)
    db.session.commit()
    return jsonify({'id': exercise.id, 'message': 'Exercise created successfully'}), 201

# Workout endpoints
@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    """Get all workouts with their exercises"""
    workouts = Workout.query.order_by(Workout.date.desc()).all()
    result = []
    
    for workout in workouts:
        workout_exercises = WorkoutExercise.query.filter_by(workout_id=workout.id).all()
        exercises = []
        for we in workout_exercises:
            exercise = Exercise.query.get(we.exercise_id)
            exercises.append({
                'exerciseId': we.exercise_id,
                'exerciseName': exercise.name if exercise else 'Unknown',
                'exerciseImage': exercise.image if exercise else '💪',
                'sets': we.sets,
                'reps': we.reps,
                'weight': we.weight,
                'notes': we.notes
            })
        
        result.append({
            'id': workout.id,
            'name': workout.name,
            'date': workout.date.isoformat(),
            'duration': workout.duration,
            'exercises': exercises
        })
    
    return jsonify(result)

@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    """Get a specific workout"""
    workout = Workout.query.get_or_404(workout_id)
    workout_exercises = WorkoutExercise.query.filter_by(workout_id=workout.id).all()
    exercises = []
    
    for we in workout_exercises:
        exercise = Exercise.query.get(we.exercise_id)
        exercises.append({
            'exerciseId': we.exercise_id,
            'exerciseName': exercise.name if exercise else 'Unknown',
            'exerciseImage': exercise.image if exercise else '💪',
            'sets': we.sets,
            'reps': we.reps,
            'weight': we.weight,
            'notes': we.notes
        })
    
    return jsonify({
        'id': workout.id,
        'name': workout.name,
        'date': workout.date.isoformat(),
        'duration': workout.duration,
        'exercises': exercises
    })

@app.route('/api/workouts', methods=['POST'])
def create_workout():
    """Create a new workout"""
    data = request.json
    
    # Parse date - handle different formats
    date_str = data.get('date', datetime.utcnow().isoformat())
    if 'Z' in date_str:
        date_str = date_str.replace('Z', '+00:00')
    try:
        workout_date = datetime.fromisoformat(date_str)
    except ValueError:
        # Fallback to current time if parsing fails
        workout_date = datetime.utcnow()
    
    # Create workout
    workout = Workout(
        name=data['name'],
        date=workout_date,
        duration=data.get('duration')
    )
    db.session.add(workout)
    db.session.flush()  # Get the workout ID
    
    # Add exercises
    for ex_data in data.get('exercises', []):
        workout_exercise = WorkoutExercise(
            workout_id=workout.id,
            exercise_id=ex_data['exerciseId'],
            sets=ex_data['sets'],
            reps=ex_data['reps'],
            weight=ex_data.get('weight'),
            notes=ex_data.get('notes', '')
        )
        db.session.add(workout_exercise)
    
    db.session.commit()
    return jsonify({'id': workout.id, 'message': 'Workout created successfully'}), 201

@app.route('/api/workouts/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    """Update a workout"""
    workout = Workout.query.get_or_404(workout_id)
    data = request.json
    
    workout.name = data.get('name', workout.name)
    if 'date' in data:
        date_str = data['date']
        if 'Z' in date_str:
            date_str = date_str.replace('Z', '+00:00')
        try:
            workout.date = datetime.fromisoformat(date_str)
        except ValueError:
            pass  # Keep existing date if parsing fails
    workout.duration = data.get('duration', workout.duration)
    
    # Update exercises if provided
    if 'exercises' in data:
        # Delete existing workout exercises
        WorkoutExercise.query.filter_by(workout_id=workout.id).delete()
        
        # Add new exercises
        for ex_data in data['exercises']:
            workout_exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_id=ex_data['exerciseId'],
                sets=ex_data['sets'],
                reps=ex_data['reps'],
                weight=ex_data.get('weight'),
                notes=ex_data.get('notes', '')
            )
            db.session.add(workout_exercise)
    
    db.session.commit()
    return jsonify({'message': 'Workout updated successfully'})

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    """Delete a workout"""
    workout = Workout.query.get_or_404(workout_id)
    
    # Delete associated workout exercises
    WorkoutExercise.query.filter_by(workout_id=workout.id).delete()
    
    # Delete workout
    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Workout deleted successfully'})

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Fitness Tracker API is running'})

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    app.run(debug=True, port=5000)
