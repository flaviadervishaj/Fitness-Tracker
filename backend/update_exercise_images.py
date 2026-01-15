"""
Script për të përditësuar foto-të e exercises në database
"""
from app import app
from models import db, Exercise

def update_exercise_images():
    """Update exercise images with real photos"""
    with app.app_context():
        # Mapping i exercises me foto-të e reja
        exercise_images = {
            'Push-ups': 'https://url-shortener.me/7TBT',
            'Squats': 'https://url-shortener.me/7TC4',
            'Pull-ups': 'https://url-shortener.me/7TCH',
            'Deadlifts': 'https://url-shortener.me/7TDB',
            'Bench Press': 'https://url-shortener.me/7TCX',
            'Plank': 'https://url-shortener.me/7TDG',
            'Lunges': 'https://url-shortener.me/7TDQ',
            'Shoulder Press': 'https://url-shortener.me/7TDY',
        }
        
        updated_count = 0
        for exercise_name, image_url in exercise_images.items():
            exercise = Exercise.query.filter_by(name=exercise_name).first()
            if exercise:
                exercise.image = image_url
                updated_count += 1
                print(f"Updated {exercise_name}")
        
        db.session.commit()
        print(f"\nUpdated {updated_count} exercises with real photos!")

if __name__ == '__main__':
    update_exercise_images()

