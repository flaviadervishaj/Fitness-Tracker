from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import jwt
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:155155@localhost:5432/fitness_tracker')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

CORS(app)  # Enable CORS for React frontend

# Import models and initialize db
from models import db, Exercise, Workout, WorkoutExercise, User
db.init_app(app)

# JWT helper functions
def generate_token(user_id):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    # Ensure token is a string (PyJWT 2.0+ returns string by default)
    return token if isinstance(token, str) else token.decode('utf-8')

def token_required(f):
    """Decorator to protect routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

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
             'description': 'Classic bodyweight exercise for upper body strength', 
             'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'},
            {'name': 'Squats', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Fundamental lower body exercise', 
             'image': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop'},
            {'name': 'Pull-ups', 'category': 'Back', 'muscle': 'Lats, Biceps', 
             'description': 'Upper body pulling exercise', 
             'image': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop'},
            {'name': 'Deadlifts', 'category': 'Back', 'muscle': 'Hamstrings, Glutes, Back', 
             'description': 'Compound movement for posterior chain', 
             'image': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop'},
            {'name': 'Bench Press', 'category': 'Chest', 'muscle': 'Chest, Shoulders, Triceps', 
             'description': 'Classic chest building exercise', 
             'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'},
            {'name': 'Plank', 'category': 'Core', 'muscle': 'Abs, Core', 
             'description': 'Isometric core strengthening exercise', 
             'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'},
            {'name': 'Lunges', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Unilateral leg exercise', 
             'image': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop'},
            {'name': 'Shoulder Press', 'category': 'Shoulders', 'muscle': 'Deltoids, Triceps', 
             'description': 'Overhead pressing movement', 
             'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'},
        ]
        
        for ex_data in exercises_data:
            exercise = Exercise(**ex_data)
            db.session.add(exercise)
        
        db.session.commit()

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Email is optional, but if provided, check if it's already taken
        email = data.get('email', '').strip()
        if email:
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400
        else:
            # Generate a fake email if not provided
            email = f"{data['username']}@fitness-tracker.local"
        
        # Create new user
        user = User(
            username=data['username'],
            email=email
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info"""
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email
    }), 200

# Exercise endpoints
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    """Get all exercises"""
    try:
        exercises = Exercise.query.all()
        return jsonify([{
            'id': ex.id,
            'name': ex.name,
            'category': ex.category,
            'muscle': ex.muscle,
            'description': ex.description,
            'image': ex.image
        } for ex in exercises])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' not in data:
            return jsonify({'error': 'Exercise name is required'}), 400
        
        exercise = Exercise(
            name=data['name'],
            category=data.get('category', 'Other'),
            muscle=data.get('muscle', ''),
            description=data.get('description', ''),
            image=data.get('image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop') # Default image URL
        )
        db.session.add(exercise)
        db.session.commit()
        return jsonify({'id': exercise.id, 'message': 'Exercise created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Workout endpoints
@app.route('/api/workouts', methods=['GET'])
@token_required
def get_workouts(current_user):
    """Get all workouts with their exercises for current user"""
    try:
        workouts = Workout.query.filter_by(user_id=current_user.id).order_by(Workout.date.desc()).all()
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
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
@token_required
def get_workout(current_user, workout_id):
    """Get a specific workout"""
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
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
@token_required
def create_workout(current_user):
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'error': 'Workout name is required'}), 400
        
        date_str = data.get('date', datetime.utcnow().isoformat())
        if 'Z' in date_str:
            date_str = date_str.replace('Z', '+00:00')
        try:
            workout_date = datetime.fromisoformat(date_str)
        except ValueError:
            workout_date = datetime.utcnow()
        
        workout = Workout(
            name=data['name'],
            date=workout_date,
            duration=data.get('duration'),
            user_id=current_user.id
        )
        db.session.add(workout)
        db.session.flush()
        
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/workouts/<int:workout_id>', methods=['PUT'])
@token_required
def update_workout(current_user, workout_id):
    """Update a workout"""
    try:
        workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
@token_required
def delete_workout(current_user, workout_id):
    """Delete a workout"""
    try:
        workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
        
        # Delete associated workout exercises
        WorkoutExercise.query.filter_by(workout_id=workout.id).delete()
        
        # Delete workout
        db.session.delete(workout)
        db.session.commit()
        return jsonify({'message': 'Workout deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Fitness Tracker API is running'})

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)  # Allow connections from network
