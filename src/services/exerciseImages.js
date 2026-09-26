// Images for the exercises included with the app. Keep the mapping here so
// existing database records with older image URLs also display correctly.
const exerciseImages = {
  'push-ups': '/exercises/push-ups.jpg',
  squats: '/exercises/squats.jpg',
  'pull-ups': '/exercises/pull-ups.jpg',
  deadlifts: '/exercises/deadlifts.jpg',
  'bench press': '/exercises/bench-press.jpg',
  plank: '/exercises/plank.jpg',
  lunges: '/exercises/lunges.jpg',
  'shoulder press': '/exercises/shoulder-press.jpg',
}

export function getExerciseImage(exercise) {
  const name = exercise.name?.trim().toLowerCase()
  return exerciseImages[name] || (exercise.image?.startsWith('http') || exercise.image?.startsWith('/') ? exercise.image : null)
}
