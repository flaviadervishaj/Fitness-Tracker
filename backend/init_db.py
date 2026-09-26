"""Create missing database tables and seed the exercise library."""

import argparse

from app import app, seed_exercises
from models import db, Exercise


def init_database(reset=False):
    with app.app_context():
        if reset:
            db.drop_all()
        db.create_all()
        if Exercise.query.count() == 0:
            seed_exercises()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Initialize the Fitness Tracker database')
    parser.add_argument('--reset', action='store_true', help='Delete all existing data before rebuilding')
    args = parser.parse_args()
    init_database(reset=args.reset)
    print('Database ready.')
