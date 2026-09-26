# Fitness Tracker - Full Stack Application

A modern, full-stack fitness tracking application with a React frontend and Python Flask backend with PostgreSQL database.

## Features

- 🏋️ **Dashboard** - Overview of your fitness statistics and recent workouts
- 📝 **Workout Tracker** - Log your workouts with exercises, sets, reps, and weights
- 📚 **Exercise Library** - Browse a curated collection of exercises with descriptions
- 📈 **Progress Tracking** - Visualize your fitness progress with charts and statistics
- 🔐 **Authentication** - Secure user authentication with JWT tokens
- 💾 **PostgreSQL Database** - Persistent data storage with SQLAlchemy ORM
- 🔌 **RESTful API** - Python Flask backend with comprehensive API endpoints
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Beautiful and intuitive user interface

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
- **PyJWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

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

7. **Initialize the database** (keeps existing users and workouts)
   ```bash
   python init_db.py
   ```

   For an intentional reset of a local development database, use `python init_db.py --reset`. This deletes all existing data.

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
│   ├── app.py                    # Flask application and API routes
│   ├── models.py                 # SQLAlchemy database models
│   ├── init_db.py                # Database initialization script
│   ├── create_db.py              # Database creation script
│   ├── requirements.txt           # Python dependencies
│   ├── instance/                 # Database instance (gitignored)
│   └── README.md                 # Backend-specific documentation
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx         # Main dashboard with stats
│   │   ├── Dashboard.css
│   │   ├── WorkoutTracker.jsx   # Workout logging component
│   │   ├── WorkoutTracker.css
│   │   ├── ExerciseLibrary.jsx  # Exercise database browser
│   │   ├── ExerciseLibrary.css
│   │   ├── Progress.jsx         # Progress tracking and charts
│   │   ├── Progress.css
│   │   ├── Login.jsx            # Authentication component
│   │   ├── Login.css
│   │   ├── Toast.jsx            # Toast notification component
│   │   └── Toast.css
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Authentication context
│   │   ├── ToastContext.jsx     # Toast notifications context
│   │   └── ToastContext.css
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.jsx                   # Main app component with routing
│   ├── App.css                   # App styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js                # Vite configuration with API proxy
├── .gitignore                    # Git ignore rules
├── start-dev.ps1                 # PowerShell script to start both servers
├── start-dev.bat                 # Batch script to start both servers
└── README.md                     # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (requires: username, password, email optional)
- `POST /api/auth/login` - Login user (requires: username, password)
- `GET /api/auth/me` - Get current user info (requires: Bearer token)

### Exercises
- `GET /api/exercises` - Get all exercises (public)
- `GET /api/exercises/<id>` - Get a specific exercise (public)
- `POST /api/exercises` - Create a new exercise (requires: Bearer token)

### Workouts
- `GET /api/workouts` - Get all workouts for current user (requires: Bearer token)
- `GET /api/workouts/<id>` - Get a specific workout (requires: Bearer token)
- `POST /api/workouts` - Create a new workout (requires: Bearer token)
- `PUT /api/workouts/<id>` - Update a workout (requires: Bearer token)
- `DELETE /api/workouts/<id>` - Delete a workout (requires: Bearer token)

### Health Check
- `GET /api/health` - Check API status (public)

## Database Schema

### Users Table
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String)
- `created_at` (DateTime)

### Exercises Table
- `id` (Integer, Primary Key)
- `name` (String)
- `category` (String)
- `muscle` (String)
- `description` (Text)
- `image` (String, URL)
- `created_at` (DateTime)

### Workouts Table
- `id` (Integer, Primary Key)
- `name` (String)
- `date` (DateTime)
- `duration` (Integer, minutes, nullable)
- `user_id` (Integer, Foreign Key to Users)
- `created_at` (DateTime)

### Workout Exercises Table
- `id` (Integer, Primary Key)
- `workout_id` (Integer, Foreign Key to Workouts)
- `exercise_id` (Integer, Foreign Key to Exercises)
- `sets` (Integer)
- `reps` (Integer)
- `weight` (Float, kg, nullable)
- `notes` (Text, nullable)
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
- Real-time API integration with error handling

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
- Verify database connection string in `app.py`
- Check that the `fitness_tracker` database exists
- Run migration script if needed: `python backend/add_user_id_to_workouts.py`

**Port Already in Use:**
- Change the port in `app.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`

**Module Not Found:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check that all dependencies are installed: `pip list`

**Authentication Errors:**
- Ensure `PyJWT` and `bcrypt` are installed
- Check that `SECRET_KEY` is set in `app.py`

### Frontend Issues

**API Connection Failed:**
- Ensure backend server is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify Vite proxy configuration in `vite.config.js`
- Check network tab for failed requests

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

**Authentication Issues:**
- Clear localStorage: `localStorage.clear()` in browser console
- Check that JWT token is being stored correctly
- Verify token expiration (tokens expire after 7 days)

## Development

### Running Both Servers

You'll need to run both the backend and frontend servers. Here are the easiest ways:

**Option 1: Use npm start (recommended - single terminal)**
```bash
npm start
```

This will start both servers in the same terminal window using `concurrently`.

**Option 2: Use start scripts (separate windows - Windows only)**
```bash
# PowerShell
.\start-dev.ps1

# Or Command Prompt
start-dev.bat
```

This will open separate windows for backend and frontend servers.

**Option 3: Run in separate terminals manually**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

### API Proxy Configuration

The frontend is configured to proxy API requests to the backend during development. This is handled by Vite's proxy configuration in `vite.config.js`:

- All requests to `/api/*` are proxied to `http://localhost:5000/api/*`
- CORS is handled automatically
- In production, set `VITE_API_URL` to the backend URL ending in `/api` if using another backend. The hosted preview and production site use the same public Flask API by default.

### Authentication Flow

1. User registers/logs in via `/login`
2. Backend returns JWT token and user data
3. Token is stored in `localStorage`
4. All API requests include token in `Authorization: Bearer <token>` header
5. Backend validates token on protected routes
6. On 401 error, user is redirected to login

### Error Handling

- All API errors are caught and displayed via React Toast notifications
- Loading states are managed in `App.jsx`
- Authentication errors trigger automatic logout and redirect
- Network errors show user-friendly messages

## License

This project is open source and available for personal use.

Exercise photographs are from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), distributed under its [Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md). The eight included images are stored in `public/exercises` so the exercise library works without a third-party image service.

## Contributing

Feel free to fork this project and make it your own! Add features, improve the UI, or customize it to fit your needs.
