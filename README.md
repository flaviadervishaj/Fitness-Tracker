# Fitness Tracker - Full Stack Application

A modern, full-stack fitness tracking application with a React frontend and Python Flask backend with PostgreSQL database.

## Features

- 🏋️ **Dashboard** - Overview of your fitness statistics and recent workouts
- 📝 **Workout Tracker** - Log your workouts with exercises, sets, reps, and weights
- 📚 **Exercise Library** - Browse a curated collection of exercises with descriptions
- 📈 **Progress Tracking** - Visualize your fitness progress with charts and statistics
- 💾 **PostgreSQL Database** - Persistent data storage with SQLAlchemy ORM
- 🔌 **RESTful API** - Python Flask backend with comprehensive API endpoints

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

### Backend
- **Python 3** - Backend language
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **Flask-CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Python 3.8 or higher
- PostgreSQL (version 12 or higher)
- npm or yarn
- pip (Python package manager)

### Backend Setup

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create the database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE fitness_tracker;
   
   # Exit psql
   \q
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Create virtual environment** (recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

5. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Configure database connection**
   ```bash
   # Copy example environment file
   cp .env.example .env
   ```
   
   Edit `.env` and update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fitness_tracker
   ```
   Replace `your_password` with your PostgreSQL password.

7. **Initialize the database**
   ```bash
   python init_db.py
   ```

8. **Start the backend server**
   ```bash
   python app.py
   ```
   
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

   Note: The frontend is configured to proxy API requests to the backend during development.

### Build for Production

**Frontend:**
```bash
npm run build
```
The built files will be in the `dist` directory.

**Backend:**
The Flask app can be deployed using gunicorn or similar WSGI server:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Project Structure

```
Fitness-Tracker/
├── backend/
│   ├── app.py              # Flask application and API routes
│   ├── models.py           # SQLAlchemy database models
│   ├── init_db.py          # Database initialization script
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── README.md           # Backend-specific documentation
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   ├── WorkoutTracker.jsx # Workout logging component
│   │   ├── ExerciseLibrary.jsx # Exercise database browser
│   │   └── Progress.jsx        # Progress tracking and charts
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component with routing
│   ├── App.css                 # App styles
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

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

## Features in Detail

### Dashboard
- View total workouts, weekly activity, exercises completed, and total minutes
- See recent workout history
- Quick access to main features

### Workout Tracker
- Create custom workout sessions
- Add multiple exercises with sets, reps, and weights
- Add notes for each exercise
- Track workout duration
- Data persists in PostgreSQL database

### Exercise Library
- Browse exercises by category
- Search exercises by name or target muscles
- View exercise descriptions and target muscle groups
- Exercises loaded from database

### Progress
- Weekly activity charts
- Most used exercises statistics
- Overall fitness metrics
- Historical data visualization

## Troubleshooting

### Backend Issues

**Connection Error:**
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check that the `fitness_tracker` database exists

**Port Already in Use:**
- Change the port in `app.py`: `app.run(debug=True, port=5001)`

**Module Not Found:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Frontend Issues

**API Connection Failed:**
- Ensure backend server is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify API_BASE_URL in `src/services/api.js`

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Development

### Running Both Servers

You'll need to run both the backend and frontend servers:

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## License

This project is open source and available for personal use.

## Contributing

Feel free to fork this project and make it your own! Add features, improve the UI, or customize it to fit your needs.
