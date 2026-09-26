# Fitness Tracker

A fitness journal with a public exercise library and a personal workout history. Visitors can browse eight exercises, view technique cues, and search by name or muscle group. An account lets them save workouts and track progress over time.

[Live site](https://fitness-tracker-two-phi.vercel.app/)

## Features

- Exercise guides with locally hosted photographs and links to detailed technique instructions
- Workout logging with sets, reps, weight, notes, and duration
- Edit and delete saved workouts
- Personal dashboard and progress summaries
- Responsive layout for desktop and mobile

## Stack

React, Vite, and CSS for the frontend; Flask, SQLAlchemy, and PostgreSQL for the API and persistent data. Authentication uses bcrypt for password hashes and signed JWTs for API requests.

## Run locally

Requires Node.js 18+, Python 3.11, and PostgreSQL.

1. Create a PostgreSQL database named `fitness_tracker`.
2. In `backend`, create a virtual environment, install dependencies, and create `.env` from `.env.example`. Set `DATABASE_URL` and a private `SECRET_KEY`.

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   python init_db.py
   python app.py
   ```

   On Windows, activate the environment with `.venv\Scripts\activate` and copy the example file with `copy .env.example .env`.

3. In another terminal, install and start the frontend:

   ```bash
   npm ci
   npm run dev
   ```

Open `http://localhost:5173`. Vite forwards `/api` requests to the local Flask server on port 5000. `npm run build` checks the production frontend bundle.

`python init_db.py` creates missing tables and seeds the exercise library without deleting existing workouts. The optional `--reset` flag deletes all local database data.

## Deployment

The frontend is configured for Vercel, including a rewrite for direct links to client routes. The Flask service uses `render.yaml`. Set `DATABASE_URL` and `SECRET_KEY` on the backend. To connect the frontend to another backend, set `VITE_API_URL` to its URL ending in `/api` at build time. Environment files and credentials are excluded from Git.

## Project layout

- `src/components`: exercise library, authentication, dashboard, workout form, and progress views
- `src/contexts`: account and notification state
- `src/data`: exercise details available while the API starts
- `src/services`: API requests and local exercise image mapping
- `public/exercises`: bundled exercise photographs
- `backend`: Flask routes, database models, and initialization script

Exercise photographs come from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), distributed under its [Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md).
