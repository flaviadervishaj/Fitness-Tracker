# Fitness Tracker - React Web Application

A modern, beautiful React web application for tracking your fitness journey. Built with React, React Router, and Vite.

## Features

- 🏋️ **Dashboard** - Overview of your fitness statistics and recent workouts
- 📝 **Workout Tracker** - Log your workouts with exercises, sets, reps, and weights
- 📚 **Exercise Library** - Browse a curated collection of exercises with descriptions
- 📈 **Progress Tracking** - Visualize your fitness progress with charts and statistics

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
fitness-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   ├── WorkoutTracker.jsx  # Workout logging component
│   │   ├── ExerciseLibrary.jsx # Exercise database browser
│   │   └── Progress.jsx        # Progress tracking and charts
│   ├── App.jsx                 # Main app component with routing
│   ├── App.css                 # App styles
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technologies Used

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

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

### Exercise Library
- Browse exercises by category
- Search exercises by name or target muscles
- View exercise descriptions and target muscle groups

### Progress
- Weekly activity charts
- Most used exercises statistics
- Overall fitness metrics

## Customization

You can easily customize the application by:
- Adding more exercises to the exercise library in `App.jsx`
- Modifying the color scheme in the CSS files
- Adding new features to existing components

## License

This project is open source and available for personal use.

## Contributing

Feel free to fork this project and make it your own! Add features, improve the UI, or customize it to fit your needs.
