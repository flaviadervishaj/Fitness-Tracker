// Short technique cues for the eight exercises included with the app.
// Full instructions are linked to the ACE Exercise Library on each card.
export const exerciseGuides = {
  'push-ups': {
    steps: ['Place your hands slightly wider than your shoulders and keep your body in a straight line.', 'Lower your chest with control, then press back up without letting your hips sag.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/',
  },
  squats: {
    steps: ['Stand with feet slightly wider than hip-width and keep your chest lifted.', 'Bend at the hips and knees, then push through your feet to stand again.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/',
  },
  'pull-ups': {
    steps: ['Grip the bar with palms facing away and brace your body.', 'Pull your chest toward the bar, then lower yourself slowly without swinging.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/191/pull-ups/',
  },
  deadlifts: {
    steps: ['Stand close to the bar, hinge at your hips and keep it near your legs.', 'Push through your feet to stand tall, then lower the bar with control.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/6/deadlift/',
  },
  'bench press': {
    steps: ['Lie on the bench with your feet planted and grip the bar slightly wider than your shoulders.', 'Lower the bar with control toward your chest, then press it upward.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/5/chest-press/',
  },
  plank: {
    steps: ['Place your elbows under your shoulders and extend your legs behind you.', 'Brace your core and keep a straight line from head to heels as you hold.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/',
  },
  lunges: {
    steps: ['Step forward from a tall stance and lower both knees with control.', 'Push through your front foot to return, then repeat on the other side.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/',
  },
  'shoulder press': {
    steps: ['Hold the weights at shoulder height with your torso steady.', 'Press upward with control, then lower the weights back to shoulder height.'],
    source: 'https://www.acefitness.org/resources/everyone/exercise-library/186/seated-shoulder-press/',
  },
}

export function getExerciseGuide(name) {
  return exerciseGuides[name?.trim().toLowerCase()]
}
