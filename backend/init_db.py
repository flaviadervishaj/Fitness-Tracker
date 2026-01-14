"""
Database initialization script
Run this script to create the database tables and seed initial data
"""
from app import app
from models import db, Exercise, Workout, WorkoutExercise

def init_database():
    """Initialize the database with tables and seed data"""
    with app.app_context():
        # Drop all tables (use with caution in production!)
        print("Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        
        # Seed initial exercises
        print("Seeding initial exercises...")
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
        print(f"✓ Database initialized successfully!")
        print(f"✓ Created {Exercise.query.count()} exercises")

if __name__ == '__main__':
    init_database()
