import os
import unittest
from unittest.mock import patch

os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-only-secret'

from app import app, db, User, _reset_attempts


class PasswordResetTests(unittest.TestCase):
    def setUp(self):
        self.config = patch.dict(os.environ, {
            'RESEND_API_KEY': 'test-key',
            'RESET_EMAIL_FROM': 'Fitness Tracker <hello@example.com>',
            'FRONTEND_URL': 'https://fitness.example.com',
        })
        self.config.start()
        with app.app_context():
            db.create_all()
            user = User(username='athlete', email='athlete@example.com')
            user.set_password('old-password')
            db.session.add(user)
            db.session.commit()
        _reset_attempts.clear()
        self.client = app.test_client()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
        self.config.stop()

    def test_reset_invalidates_link_and_old_session(self):
        old_token = self.client.post('/api/auth/login', json={
            'username': 'athlete', 'password': 'old-password',
        }).json['token']
        self.assertEqual(self.client.get('/api/auth/me', headers={'Authorization': f'Bearer {old_token}'}).status_code, 200)

        with patch('app.send_reset_email') as send:
            response = self.client.post('/api/auth/password-reset/request', json={'email': 'athlete@example.com'})
            self.assertEqual(response.status_code, 200)
            link = send.call_args.args[1]
            self.assertIn('https://fitness.example.com/reset-password?token=', link)
            token = link.split('token=', 1)[1]

        response = self.client.post('/api/auth/password-reset/confirm', json={'token': token, 'password': 'new-password'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.post('/api/auth/password-reset/confirm', json={'token': token, 'password': 'another-password'}).status_code, 400)
        self.assertEqual(self.client.get('/api/auth/me', headers={'Authorization': f'Bearer {old_token}'}).status_code, 401)
        self.assertEqual(self.client.post('/api/auth/login', json={'username': 'athlete', 'password': 'new-password'}).status_code, 200)

    def test_unknown_email_does_not_disclose_account(self):
        with patch('app.send_reset_email') as send:
            response = self.client.post('/api/auth/password-reset/request', json={'email': 'missing@example.com'})
            self.assertEqual(response.status_code, 200)
            self.assertIn('If an account', response.json['message'])
            send.assert_not_called()

    def test_registration_requires_email_when_recovery_is_enabled(self):
        response = self.client.post('/api/auth/register', json={
            'username': 'new-user', 'password': 'a-secure-password',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json['error'])


if __name__ == '__main__':
    unittest.main()
