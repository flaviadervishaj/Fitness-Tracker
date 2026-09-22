from datetime import datetime, timedelta, timezone
from functools import wraps
import logging
import os
import re

import jwt
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from models import db, Exercise, User, Workout, WorkoutExercise


load_dotenv()

app = Flask(__name__)

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError('DATABASE_URL is required. Add it to backend/.env.')

if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
SECRET_KEY = os.getenv('SECRET_KEY')
if IS_PRODUCTION and not SECRET_KEY:
    raise ValueError('SECRET_KEY is required in production.')

app.config.update(
    SQLALCHEMY_DATABASE_URI=DATABASE_URL,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=SECRET_KEY or 'development-only-change-me',
)

cors_origins = [
    origin.strip()
    for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    if origin.strip()
]
CORS(app, resources={r'/api/*': {'origins': cors_origins}})
db.init_app(app)


EXERCISE_SEED_DATA = [
    {
        'name': 'Push-ups',
        'category': 'Chest',
        'muscle': 'Chest, Triceps',
        'description': 'Classic bodyweight exercise for upper body strength',
        'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
        'name': 'Squats',
        'category': 'Legs',
        'muscle': 'Quadriceps, Glutes',
        'description': 'Fundamental lower body exercise',
        'image': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop',
    },
    {
        'name': 'Pull-ups',
        'category': 'Back',
        'muscle': 'Lats, Biceps',
        'description': 'Upper body pulling exercise',
        'image': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    },
    {
        'name': 'Deadlifts',
        'category': 'Back',
        'muscle': 'Hamstrings, Glutes, Back',
        'description': 'Compound movement for posterior chain',
        'image': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    },
    {
        'name': 'Bench Press',
        'category': 'Chest',
        'muscle': 'Chest, Shoulders, Triceps',
        'description': 'Classic chest building exercise',
        'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
        'name': 'Plank',
        'category': 'Core',
        'muscle': 'Abs, Core',
        'description': 'Isometric core strengthening exercise',
        'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
        'name': 'Lunges',
        'category': 'Legs',
        'muscle': 'Quadriceps, Glutes',
        'description': 'Unilateral leg exercise',
        'image': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop',
    },
    {
        'name': 'Shoulder Press',
        'category': 'Shoulders',
        'muscle': 'Deltoids, Triceps',
        'description': 'Overhead pressing movement',
        'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
]


def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def token_required(view):
    @wraps(view)
    def decorated(*args, **kwargs):
        authorization = request.headers.get('Authorization', '')
        scheme, _, token = authorization.partition(' ')

        if scheme.lower() != 'bearer' or not token:
            return jsonify({'error': 'A valid Bearer token is required'}), 401

        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.session.get(User, payload.get('user_id'))
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return view(current_user, *args, **kwargs)

    return decorated


def seed_exercises():
    if Exercise.query.count() > 0:
        return

    db.session.add_all([Exercise(**exercise) for exercise in EXERCISE_SEED_DATA])
    db.session.commit()


def init_database():
    with app.app_context():
        db.create_all()
        seed_exercises()


def serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }


def serialize_exercise(exercise):
    return {
        'id': exercise.id,
        'name': exercise.name,
        'category': exercise.category,
        'muscle': exercise.muscle,
        'description': exercise.description,
        'image': exercise.image,
    }


def serialize_workout(workout):
    return {
        'id': workout.id,
        'name': workout.name,
        'date': workout.date.isoformat(),
        'duration': workout.duration,
        'exercises': [
            {
                'exerciseId': workout_exercise.exercise_id,
                'exerciseName': workout_exercise.exercise.name,
                'exerciseImage': workout_exercise.exercise.image,
                'sets': workout_exercise.sets,
                'reps': workout_exercise.reps,
                'weight': workout_exercise.weight,
                'notes': workout_exercise.notes,
            }
            for workout_exercise in workout.workout_exercises
        ],
    }


def parse_workout_date(value):
    if not value:
        return datetime.now(timezone.utc).replace(tzinfo=None)

    try:
        parsed_date = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    except ValueError as error:
        raise ValueError('Date must be a valid ISO 8601 value') from error

    if parsed_date.tzinfo:
        parsed_date = parsed_date.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed_date


def validate_workout_payload(data, require_exercises=True):
    name = str(data.get('name', '')).strip()
    if len(name) < 2 or len(name) > 100:
        raise ValueError('Workout name must be between 2 and 100 characters')

    duration = data.get('duration')
    if duration in ('', None):
        duration = None
    else:
        try:
            duration = int(duration)
        except (TypeError, ValueError) as error:
            raise ValueError('Duration must be a whole number') from error
        if duration < 1 or duration > 1440:
            raise ValueError('Duration must be between 1 and 1440 minutes')

    raw_exercises = data.get('exercises')
    if raw_exercises is None:
        if require_exercises:
            raise ValueError('Add at least one exercise')
        return name, duration, None

    if not isinstance(raw_exercises, list) or not raw_exercises:
        raise ValueError('Add at least one exercise')

    normalized_exercises = []
    exercise_ids = set()

    for item in raw_exercises:
        try:
            exercise_id = int(item.get('exerciseId'))
            sets = int(item.get('sets'))
            reps = int(item.get('reps'))
            weight = item.get('weight')
            weight = float(weight) if weight not in ('', None) else None
        except (AttributeError, TypeError, ValueError) as error:
            raise ValueError('Each exercise needs valid sets, reps and an exercise ID') from error

        if sets < 1 or sets > 100 or reps < 1 or reps > 1000:
            raise ValueError('Sets must be 1–100 and reps must be 1–1000')
        if weight is not None and (weight < 0 or weight > 1000):
            raise ValueError('Weight must be between 0 and 1000 kg')

        exercise_ids.add(exercise_id)
        normalized_exercises.append({
            'exercise_id': exercise_id,
            'sets': sets,
            'reps': reps,
            'weight': weight,
            'notes': str(item.get('notes', '')).strip()[:500],
        })

    existing_ids = {
        exercise.id
        for exercise in Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
    }
    if existing_ids != exercise_ids:
        raise ValueError('One or more selected exercises do not exist')

    return name, duration, normalized_exercises


@app.errorhandler(404)
def not_found(_error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(405)
def method_not_allowed(_error):
    return jsonify({'error': 'Method not allowed'}), 405


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))

    if not re.fullmatch(r'[A-Za-z0-9_]{3,30}', username):
        return jsonify({'error': 'Username must be 3–30 characters using letters, numbers or underscores'}), 400
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        return jsonify({'error': 'A valid email address is required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must contain at least 8 characters'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'message': 'User created successfully',
            'token': generate_token(user.id),
            'user': serialize_user(user),
        }), 201
    except Exception:
        db.session.rollback()
        app.logger.exception('Registration failed')
        return jsonify({'error': 'Unable to create the account'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'token': generate_token(user.id),
        'user': serialize_user(user),
    })


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify(serialize_user(current_user))


@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    exercises = Exercise.query.order_by(Exercise.name).all()
    return jsonify([serialize_exercise(exercise) for exercise in exercises])


@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    exercise = db.get_or_404(Exercise, exercise_id)
    return jsonify(serialize_exercise(exercise))


@app.route('/api/exercises', methods=['POST'])
@token_required
def create_exercise(_current_user):
    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip()
    if not name:
        return jsonify({'error': 'Exercise name is required'}), 400

    try:
        exercise = Exercise(
            name=name[:100],
            category=str(data.get('category', 'Other')).strip()[:50] or 'Other',
            muscle=str(data.get('muscle', '')).strip()[:200],
            description=str(data.get('description', '')).strip(),
            image=str(data.get('image', '')).strip()[:500] or None,
        )
        db.session.add(exercise)
        db.session.commit()
        return jsonify(serialize_exercise(exercise)), 201
    except Exception:
        db.session.rollback()
        app.logger.exception('Exercise creation failed')
        return jsonify({'error': 'Unable to create the exercise'}), 500


@app.route('/api/workouts', methods=['GET'])
@token_required
def get_workouts(current_user):
    workouts = (
        Workout.query
        .filter_by(user_id=current_user.id)
        .order_by(Workout.date.desc())
        .all()
    )
    return jsonify([serialize_workout(workout) for workout in workouts])


@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
@token_required
def get_workout(current_user, workout_id):
    workout = Workout.query.filter_by(
        id=workout_id,
        user_id=current_user.id,
    ).first_or_404()
    return jsonify(serialize_workout(workout))


@app.route('/api/workouts', methods=['POST'])
@token_required
def create_workout(current_user):
    data = request.get_json(silent=True) or {}

    try:
        name, duration, exercises = validate_workout_payload(data)
        workout = Workout(
            name=name,
            date=parse_workout_date(data.get('date')),
            duration=duration,
            user_id=current_user.id,
        )
        db.session.add(workout)
        db.session.flush()

        db.session.add_all([
            WorkoutExercise(workout_id=workout.id, **exercise)
            for exercise in exercises
        ])
        db.session.commit()
        return jsonify({
            'id': workout.id,
            'message': 'Workout created successfully',
        }), 201
    except ValueError as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400
    except Exception:
        db.session.rollback()
        app.logger.exception('Workout creation failed')
        return jsonify({'error': 'Unable to save the workout'}), 500


@app.route('/api/workouts/<int:workout_id>', methods=['PUT'])
@token_required
def update_workout(current_user, workout_id):
    workout = Workout.query.filter_by(
        id=workout_id,
        user_id=current_user.id,
    ).first_or_404()
    data = request.get_json(silent=True) or {}

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        merged_data = {
            'name': data.get('name', workout.name),
            'duration': data.get('duration', workout.duration),
            'exercises': data.get('exercises') if 'exercises' in data else None,
        }
        name, duration, exercises = validate_workout_payload(
            merged_data,
            require_exercises=False,
        )

        workout.name = name
        workout.duration = duration
        if 'date' in data:
            workout.date = parse_workout_date(data['date'])

        if exercises is not None:
            WorkoutExercise.query.filter_by(workout_id=workout.id).delete()
            db.session.add_all([
                WorkoutExercise(workout_id=workout.id, **exercise)
                for exercise in exercises
            ])

        db.session.commit()
        return jsonify({'message': 'Workout updated successfully'})
    except ValueError as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400
    except Exception:
        db.session.rollback()
        app.logger.exception('Workout update failed')
        return jsonify({'error': 'Unable to update the workout'}), 500


@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
@token_required
def delete_workout(current_user, workout_id):
    workout = Workout.query.filter_by(
        id=workout_id,
        user_id=current_user.id,
    ).first_or_404()

    try:
        db.session.delete(workout)
        db.session.commit()
        return jsonify({'message': 'Workout deleted successfully'})
    except Exception:
        db.session.rollback()
        app.logger.exception('Workout deletion failed')
        return jsonify({'error': 'Unable to delete the workout'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Fitness Tracker API is running'})


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    if not IS_PRODUCTION:
        init_database()

    app.run(
        debug=not IS_PRODUCTION,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
    )
