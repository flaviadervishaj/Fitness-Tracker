import os
import sys
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['FLASK_ENV'] = 'testing'

from app import app, seed_exercises  # noqa: E402
from models import db  # noqa: E402


@pytest.fixture(autouse=True)
def database():
    app.config.update(TESTING=True)
    with app.app_context():
        db.create_all()
        seed_exercises()
        yield
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client():
    return app.test_client()


def register(client, username='flavia', email='flavia@example.com'):
    return client.post('/api/auth/register', json={
        'username': username,
        'email': email,
        'password': 'strongpass123',
    })


def auth_header(response):
    return {'Authorization': f"Bearer {response.get_json()['token']}"}


def test_registration_validates_input(client):
    response = client.post('/api/auth/register', json={
        'username': 'x',
        'email': 'not-an-email',
        'password': 'short',
    })

    assert response.status_code == 400
    assert 'Username' in response.get_json()['error']


def test_user_can_register_and_restore_session(client):
    registration = register(client)
    response = client.get('/api/auth/me', headers=auth_header(registration))

    assert registration.status_code == 201
    assert response.status_code == 200
    assert response.get_json()['username'] == 'flavia'


def test_workouts_require_authentication(client):
    response = client.get('/api/workouts')

    assert response.status_code == 401


def test_user_can_create_and_list_workout(client):
    registration = register(client)
    headers = auth_header(registration)
    exercise_id = client.get('/api/exercises').get_json()[0]['id']

    created = client.post('/api/workouts', headers=headers, json={
        'name': 'Upper body',
        'duration': 45,
        'exercises': [{
            'exerciseId': exercise_id,
            'sets': 3,
            'reps': 10,
            'weight': 20,
        }],
    })
    workouts = client.get('/api/workouts', headers=headers)

    assert created.status_code == 201
    assert workouts.status_code == 200
    assert workouts.get_json()[0]['name'] == 'Upper body'
    assert workouts.get_json()[0]['exercises'][0]['sets'] == 3


def test_workouts_are_private_to_each_user(client):
    first_user = register(client)
    exercise_id = client.get('/api/exercises').get_json()[0]['id']
    client.post('/api/workouts', headers=auth_header(first_user), json={
        'name': 'Private workout',
        'exercises': [{'exerciseId': exercise_id, 'sets': 2, 'reps': 8}],
    })

    second_user = register(client, 'second_user', 'second@example.com')
    response = client.get('/api/workouts', headers=auth_header(second_user))

    assert response.status_code == 200
    assert response.get_json() == []


def test_invalid_workout_values_are_rejected(client):
    registration = register(client)
    exercise_id = client.get('/api/exercises').get_json()[0]['id']
    response = client.post('/api/workouts', headers=auth_header(registration), json={
        'name': 'Invalid workout',
        'exercises': [{'exerciseId': exercise_id, 'sets': 0, 'reps': 10}],
    })

    assert response.status_code == 400
    assert 'Sets' in response.get_json()['error']
