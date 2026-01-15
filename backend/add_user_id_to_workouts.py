"""
Migration script to add user_id column to workouts table
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from sqlalchemy import text

def migrate():
    """Add user_id column to workouts table"""
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='workouts' AND column_name='user_id'
            """))
            
            if result.fetchone():
                print("Column 'user_id' already exists in 'workouts' table")
                return
            
            # Get the first user (or create a default one)
            from models import User
            first_user = User.query.first()
            
            if not first_user:
                print("No users found. Please create a user first.")
                return
            
            print(f"Using user ID {first_user.id} ({first_user.username}) for existing workouts")
            
            # Add user_id column (nullable first)
            print("Adding user_id column to workouts table...")
            db.session.execute(text("""
                ALTER TABLE workouts 
                ADD COLUMN user_id INTEGER
            """))
            db.session.commit()
            
            # Set default user_id for existing workouts
            print("Setting user_id for existing workouts...")
            db.session.execute(text("""
                UPDATE workouts 
                SET user_id = :user_id 
                WHERE user_id IS NULL
            """), {"user_id": first_user.id})
            db.session.commit()
            
            # Make user_id NOT NULL and add foreign key constraint
            print("Making user_id NOT NULL and adding foreign key constraint...")
            db.session.execute(text("""
                ALTER TABLE workouts 
                ALTER COLUMN user_id SET NOT NULL
            """))
            db.session.commit()
            
            db.session.execute(text("""
                ALTER TABLE workouts 
                ADD CONSTRAINT fk_workouts_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id)
            """))
            db.session.commit()
            
            print("Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error during migration: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == '__main__':
    migrate()

