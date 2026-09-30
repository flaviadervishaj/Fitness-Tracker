from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import jwt
import hashlib
import hmac
import json
import logging
import time
from html import escape
from functools import wraps
from threading import Lock
from urllib.parse import quote
from urllib.request import Request, urlopen
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required. Please set it in your .env file.")
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

CORS(app)  # Enable CORS for React frontend

# Import models and initialize db
from models import db, Exercise, Workout, WorkoutExercise, User
db.init_app(app)

RESET_MESSAGE = 'If an account uses this email address, a reset link will arrive shortly.'
_reset_attempts = {}
_reset_lock = Lock()


def reset_email_enabled():
    return all(os.getenv(name) for name in ('RESEND_API_KEY', 'RESET_EMAIL_FROM', 'FRONTEND_URL'))


def reset_rate_limited(email):
    # Small per-process guard; use a shared rate limiter if the service is scaled out.
    key = (request.remote_addr, email)
    now = time.monotonic()
    with _reset_lock:
        for expired_key, last_attempt in list(_reset_attempts.items()):
            if now - last_attempt > 60:
                del _reset_attempts[expired_key]
        if key in _reset_attempts:
            return True
        _reset_attempts[key] = now
    return False


def send_reset_email(address, link):
    safe_link = escape(link, quote=True)
    body = json.dumps({
        'from': os.environ['RESET_EMAIL_FROM'],
        'to': [address],
        'subject': 'Reset your Fitness Tracker password',
        'text': f'Open this link to reset your password. It expires in 30 minutes:\n{link}\n\nIf you did not request this, ignore this email.',
        'html': f'<p>Use this link to reset your Fitness Tracker password. It expires in 30 minutes.</p><p><a href="{safe_link}">Reset password</a></p><p>If you did not request this, ignore this email.</p>',
    }).encode('utf-8')
    email_request = Request('https://api.resend.com/emails', data=body, headers={
        'Authorization': f"Bearer {os.environ['RESEND_API_KEY']}",
        'Content-Type': 'application/json',
    }, method='POST')
    with urlopen(email_request, timeout=10):
        pass

# JWT helper functions
def generate_token(user_id):
    """Generate JWT token"""
    user = db.session.get(User, user_id)
    payload = {
        'user_id': user_id,
        'password': hashlib.sha256(user.password_hash.encode('utf-8')).hexdigest(),
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
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            digest = hashlib.sha256(current_user.password_hash.encode('utf-8')).hexdigest()
            if not hmac.compare_digest(digest, data.get('password', '')):
                return jsonify({'error': 'Session expired'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Initialize database
def init_database():
    """Initialize database tables and seed data"""
    try:
        with app.app_context():
            db.create_all()
            # Seed initial exercises if database is empty
            if Exercise.query.count() == 0:
                seed_exercises()
    except Exception as e:
        print(f"Database initialization error: {e}")
        # Don't fail if tables already exist

def seed_exercises():
    """Seed the database with initial exercises"""
    with app.app_context():
        exercises_data = [
            {'name': 'Push-ups', 'category': 'Chest', 'muscle': 'Chest, Triceps', 
             'description': 'Classic bodyweight exercise for upper body strength', 
             'image': '/exercises/push-ups.jpg'},
            {'name': 'Squats', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Fundamental lower body exercise', 
             'image': '/exercises/squats.jpg'},
            {'name': 'Pull-ups', 'category': 'Back', 'muscle': 'Lats, Biceps', 
             'description': 'Upper body pulling exercise', 
             'image': '/exercises/pull-ups.jpg'},
            {'name': 'Deadlifts', 'category': 'Back', 'muscle': 'Hamstrings, Glutes, Back', 
             'description': 'Compound movement for posterior chain', 
             'image': '/exercises/deadlifts.jpg'},
            {'name': 'Bench Press', 'category': 'Chest', 'muscle': 'Chest, Shoulders, Triceps', 
             'description': 'Classic chest building exercise', 
             'image': '/exercises/bench-press.jpg'},
            {'name': 'Plank', 'category': 'Core', 'muscle': 'Abs, Core', 
             'description': 'Isometric core strengthening exercise', 
             'image': '/exercises/plank.jpg'},
            {'name': 'Lunges', 'category': 'Legs', 'muscle': 'Quadriceps, Glutes', 
             'description': 'Unilateral leg exercise', 
             'image': '/exercises/lunges.jpg'},
            {'name': 'Shoulder Press', 'category': 'Shoulders', 'muscle': 'Deltoids, Triceps', 
             'description': 'Overhead pressing movement', 
             'image': '/exercises/shoulder-press.jpg'},
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
        
        if not isinstance(data.get('username'), str) or not data['username'].strip() or not isinstance(data.get('password'), str) or len(data['password']) < 6:
            return jsonify({'error': 'Enter a username and a password of at least 6 characters'}), 400
        
        # Check if user already exists
        if User.query.filter(db.func.lower(User.username) == data['username'].strip().lower()).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Once recovery is enabled, new accounts need a reachable address.
        raw_email = data.get('email', '')
        if not isinstance(raw_email, str):
            return jsonify({'error': 'Enter a valid email address'}), 400
        email = raw_email.strip().lower()
        if reset_email_enabled() and (not email or '@' not in email or email.endswith('@fitness-tracker.local')):
            return jsonify({'error': 'An email address is required for password recovery'}), 400
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

        if not isinstance(username, str) or not username.strip() or not isinstance(password, str) or not password:
            return jsonify({'error': 'Username or email and password are required'}), 400

        identifier = username.strip()
        if '@' in identifier:
            user = User.query.filter(db.func.lower(User.email) == identifier.lower()).first()
        else:
            user = User.query.filter(db.func.lower(User.username) == identifier.lower()).first()
        
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


@app.route('/api/auth/password-reset/available', methods=['GET'])
def password_reset_available():
    return jsonify({'available': reset_email_enabled()})


@app.route('/api/auth/password-reset/request', methods=['POST'])
def request_password_reset():
    if not reset_email_enabled():
        return jsonify({'error': 'Password recovery is temporarily unavailable.'}), 503
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    if not isinstance(email, str) or not email.strip() or len(email) > 120:
        return jsonify({'error': 'Enter a valid email address.'}), 400
    email = email.strip().lower()
    if reset_rate_limited(email):
        return jsonify({'message': RESET_MESSAGE})

    user = User.query.filter(db.func.lower(User.email) == email).first()
    if user and not email.endswith('@fitness-tracker.local'):
        token = jwt.encode({
            'purpose': 'password-reset',
            'user_id': user.id,
            'password': hashlib.sha256(user.password_hash.encode('utf-8')).hexdigest(),
            'exp': datetime.utcnow() + timedelta(minutes=30),
        }, app.config['SECRET_KEY'], algorithm='HS256')
        link = f"{os.environ['FRONTEND_URL'].rstrip('/')}/reset-password?token={quote(token)}"
        try:
            send_reset_email(user.email, link)
        except Exception:
            logging.exception('Password reset email delivery failed')
            # Keep the response identical for existing and unknown addresses.
    return jsonify({'message': RESET_MESSAGE})


@app.route('/api/auth/password-reset/confirm', methods=['POST'])
def confirm_password_reset():
    data = request.get_json(silent=True) or {}
    token, password = data.get('token'), data.get('password')
    if not isinstance(token, str) or len(token) > 2048 or not isinstance(password, str) or not 8 <= len(password) <= 128:
        return jsonify({'error': 'Enter a password of 8 to 128 characters.'}), 400
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload.get('purpose') != 'password-reset':
            raise jwt.InvalidTokenError()
        user = db.session.get(User, payload['user_id'])
        digest = hashlib.sha256(user.password_hash.encode('utf-8')).hexdigest() if user else ''
        if not hmac.compare_digest(digest, payload.get('password', '')):
            raise jwt.InvalidTokenError()
    except (jwt.InvalidTokenError, KeyError, TypeError):
        return jsonify({'error': 'This reset link is invalid or has expired. Request a new one.'}), 400

    user.set_password(password)
    db.session.commit()
    return jsonify({'message': 'Password updated. You can sign in now.'})

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
        
        if not isinstance(data.get('name'), str) or not data['name'].strip():
            return jsonify({'error': 'Exercise name is required'}), 400
        
        exercise = Exercise(
            name=data['name'],
            category=data.get('category', 'Other'),
            muscle=data.get('muscle', ''),
            description=data.get('description', ''),
            image=data.get('image')
        )
        db.session.add(exercise)
        db.session.commit()
        return jsonify({'id': exercise.id, 'message': 'Exercise created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Workout endpoints
def validate_workout_data(data, require_all=False):
    if not isinstance(data, dict):
        return 'No data provided'
    if require_all or 'name' in data:
        if not isinstance(data.get('name'), str) or not data['name'].strip():
            return 'Workout name is required'
    if require_all or 'exercises' in data:
        exercises = data.get('exercises')
        if not isinstance(exercises, list) or not exercises:
            return 'Add at least one exercise'
        for entry in exercises:
            if not isinstance(entry, dict) or not all(key in entry for key in ('exerciseId', 'sets', 'reps')):
                return 'Exercise, sets, and reps are required'
            if any(not isinstance(entry[key], int) or isinstance(entry[key], bool) or entry[key] <= 0 for key in ('sets', 'reps')):
                return 'Sets and reps must be positive whole numbers'
            if not isinstance(entry['exerciseId'], int) or not db.session.get(Exercise, entry['exerciseId']):
                return 'Exercise not found'
            weight = entry.get('weight')
            if weight is not None and (not isinstance(weight, (int, float)) or isinstance(weight, bool) or weight < 0):
                return 'Weight must be zero or greater'
    duration = data.get('duration')
    if duration is not None and (not isinstance(duration, int) or isinstance(duration, bool) or duration < 0):
        return 'Duration must be zero or greater'
    return None

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
                    'exerciseImage': exercise.image if exercise else None,
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
            'exerciseImage': exercise.image if exercise else None,
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
        error = validate_workout_data(data, require_all=True)
        if error:
            return jsonify({'error': error}), 400
        
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
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first()
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        error = validate_workout_data(data)
        if error:
            return jsonify({'error': error}), 400
        
        workout.name = data.get('name', workout.name)
        if 'date' in data:
            date_str = data['date']
            if not isinstance(date_str, str):
                return jsonify({'error': 'Invalid date'}), 400
            if 'Z' in date_str:
                date_str = date_str.replace('Z', '+00:00')
            try:
                workout.date = datetime.fromisoformat(date_str)
            except ValueError:
                return jsonify({'error': 'Invalid date'}), 400
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
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first()
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    try:
        
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
    # Only initialize database if not in production (handled by gunicorn)
    if os.environ.get('FLASK_ENV') != 'production':
        init_database()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
