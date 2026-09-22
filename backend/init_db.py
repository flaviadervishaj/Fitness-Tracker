"""Create the database tables and seed the exercise library.

Use --reset only when you intentionally want to delete local data.
"""

import argparse

from app import app, seed_exercises
from models import db


def initialize_database(reset=False):
    with app.app_context():
        if reset:
            print('Reset requested: dropping existing tables...')
            db.drop_all()

        print('Creating missing database tables...')
        db.create_all()
        seed_exercises()
        print('Database is ready.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Initialize the Fitness Tracker database')
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Delete existing tables before recreating them',
    )
    arguments = parser.parse_args()
    initialize_database(reset=arguments.reset)
