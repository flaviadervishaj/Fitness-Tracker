# Fitness Tracker Backend API

Python Flask backend with PostgreSQL database for the Fitness Tracker application.

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

- **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql` or download from the official site
- **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

### 2. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fitness_tracker;

# Exit psql
\q
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Database Connection

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fitness_tracker
```

Replace `your_password` with your PostgreSQL password.

### 5. Initialize Database

Run the initialization script to create tables and seed initial data:

```bash
python init_db.py
```

### 6. Run the Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/<id>` - Get a specific exercise
- `POST /api/exercises` - Create a new exercise

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/<id>` - Get a specific workout
- `POST /api/workouts` - Create a new workout
- `PUT /api/workouts/<id>` - Update a workout
- `DELETE /api/workouts/<id>` - Delete a workout

### Health Check
- `GET /api/health` - Check API status

## Database Schema

### Exercises Table
- `id` (Integer, Primary Key)
- `name` (String)
- `category` (String)
- `muscle` (String)
- `description` (Text)
- `image` (String)
- `created_at` (DateTime)

### Workouts Table
- `id` (Integer, Primary Key)
- `name` (String)
- `date` (DateTime)
- `duration` (Integer, minutes)
- `created_at` (DateTime)

### Workout Exercises Table
- `id` (Integer, Primary Key)
- `workout_id` (Integer, Foreign Key)
- `exercise_id` (Integer, Foreign Key)
- `sets` (Integer)
- `reps` (Integer)
- `weight` (Float, kg)
- `notes` (Text)
- `created_at` (DateTime)

## Troubleshooting

### Connection Error
If you get a connection error, check:
1. PostgreSQL is running
2. Database credentials in `.env` are correct
3. Database `fitness_tracker` exists

### Port Already in Use
If port 5000 is already in use, change it in `app.py`:
```python
app.run(debug=True, port=5001)  # Use different port
```
