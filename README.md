# Fitness Tracker

A full-stack workout tracking application built with React, Flask, and PostgreSQL. Users can create an account, log structured workouts, browse exercises, and review training progress from a responsive dashboard.

## Highlights

- JWT-based registration and sign-in with bcrypt password hashing
- Private workout history with ownership checks on every workout request
- Exercise library with search and category filters
- Workout logging for duration, sets, reps, weight, and notes
- Dashboard metrics and chronological progress history
- Validated API payloads and consistent JSON error responses
- PostgreSQL constraints, indexes, and protected Supabase Data API access
- Responsive interface for desktop and mobile screens
- Automated API tests for authentication, validation, and data isolation

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Vite, CSS |
| Backend | Python, Flask, Flask-SQLAlchemy |
| Database | PostgreSQL / Supabase |
| Authentication | JWT, bcrypt |
| Testing | pytest |
| Production server | Gunicorn |

## Architecture

The React client communicates exclusively with the Flask REST API. The API validates requests, authenticates users, enforces workout ownership, and accesses PostgreSQL through SQLAlchemy. Supabase can host the PostgreSQL database, but the browser does not access database tables directly.

## Local setup

### Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer
- PostgreSQL 14 or newer, or a Supabase PostgreSQL connection string

### 1. Configure the backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

Set these values in `backend/.env`:

```dotenv
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitness_tracker
SECRET_KEY=replace-with-a-long-random-value
CORS_ORIGINS=http://localhost:5173
FLASK_ENV=development
```

Initialize the schema and starter exercises without deleting existing data:

```bash
python backend/init_db.py
```

To intentionally rebuild a local development database from scratch:

```bash
python backend/init_db.py --reset
```

Start the API:

```bash
python backend/app.py
```

The API runs at `http://localhost:5000`.

### 2. Start the frontend

In a second terminal:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Flask server during local development.

## Verification

Build the production frontend:

```bash
npm run build
```

Run the backend test suite:

```bash
pip install -r backend/requirements-dev.txt
pytest backend/tests -q
```

The tests cover registration validation, authenticated sessions, protected routes, workout creation, invalid workout values, and cross-user data isolation.

## API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Start an authenticated session |
| `GET` | `/api/auth/me` | Authenticated | Validate the current session |
| `GET` | `/api/exercises` | Public | List available exercises |
| `GET` | `/api/exercises/:id` | Public | Get one exercise |
| `POST` | `/api/exercises` | Authenticated | Add an exercise |
| `GET` | `/api/workouts` | Authenticated | List the current user's workouts |
| `GET` | `/api/workouts/:id` | Authenticated | Get one owned workout |
| `POST` | `/api/workouts` | Authenticated | Log a workout |
| `PUT` | `/api/workouts/:id` | Authenticated | Update an owned workout |
| `DELETE` | `/api/workouts/:id` | Authenticated | Delete an owned workout |
| `GET` | `/api/health` | Public | Check API availability |

Authenticated requests use the header `Authorization: Bearer <token>`.

## Supabase setup

For a new Supabase database, run `supabase_setup.sql` in the SQL Editor and set the resulting PostgreSQL connection string as `DATABASE_URL`. The script creates the schema, constraints, indexes, and starter exercises. It also enables row-level security and removes direct `anon` and `authenticated` table privileges because all application data access goes through Flask.

## Project structure

```text
Fitness-Tracker/
├── backend/
│   ├── app.py                 # Flask API and request validation
│   ├── models.py              # SQLAlchemy models
│   ├── init_db.py             # Safe database initialization
│   ├── requirements.txt       # Runtime dependencies
│   ├── requirements-dev.txt   # Test dependencies
│   └── tests/                 # API test suite
├── public/                    # Static assets
├── src/
│   ├── components/            # Dashboard and feature views
│   ├── contexts/              # Authentication and toast state
│   └── services/              # API client
├── supabase_setup.sql         # PostgreSQL/Supabase schema
└── vite.config.js             # Vite development configuration
```

## Production notes

- Always provide a unique `SECRET_KEY`; production startup fails if it is missing.
- Restrict `CORS_ORIGINS` to the deployed frontend origin.
- Use a managed PostgreSQL connection string for `DATABASE_URL`.
- Serve the Flask application with Gunicorn and the frontend from the generated `dist` directory.

## License

This project is available for educational and portfolio use.
