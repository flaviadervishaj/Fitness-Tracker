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
        print(f"✓ Database initialized successfully!")
        print(f"✓ Created {Exercise.query.count()} exercises")

if __name__ == '__main__':
    init_database()
