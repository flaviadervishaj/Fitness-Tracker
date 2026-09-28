import os
import unittest

os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-only-secret'

from app import app, db, User  # noqa: E402


class LoginTests(unittest.TestCase):
    def setUp(self):
        with app.app_context():
            db.create_all()
            user = User(username='Flavia', email='flavia@example.com')
            user.set_password('correct-password')
            db.session.add(user)
            db.session.commit()
        self.client = app.test_client()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_accepts_username_case_and_email(self):
        for identifier in ('Flavia', 'flavia', ' FLAVIA ', 'FLAVIA@EXAMPLE.COM'):
            response = self.client.post('/api/auth/login', json={
                'username': identifier, 'password': 'correct-password',
            })
            self.assertEqual(response.status_code, 200)

    def test_wrong_password_still_fails_and_case_duplicate_is_rejected(self):
        response = self.client.post('/api/auth/login', json={
            'username': 'flavia', 'password': 'wrong-password',
        })
        self.assertEqual(response.status_code, 401)

        duplicate = self.client.post('/api/auth/register', json={
            'username': 'flavia', 'email': 'another@example.com', 'password': 'secure-password',
        })
        self.assertEqual(duplicate.status_code, 400)


if __name__ == '__main__':
    unittest.main()
