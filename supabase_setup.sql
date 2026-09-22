-- Supabase Database Setup Script
-- Ekzekuto këtë në Supabase SQL Editor

-- Krijo tabelën users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Krijo tabelën exercises
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    muscle VARCHAR(200),
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Krijo tabelën workouts
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    duration INTEGER,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Krijo tabelën workout_exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight FLOAT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- The browser never connects directly to these tables. The Flask API owns all
-- authentication and data access, so block anon/authenticated Data API roles.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE users FROM anon, authenticated;
REVOKE ALL ON TABLE exercises FROM anon, authenticated;
REVOKE ALL ON TABLE workouts FROM anon, authenticated;
REVOKE ALL ON TABLE workout_exercises FROM anon, authenticated;
REVOKE ALL ON SEQUENCE users_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE exercises_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE workouts_id_seq FROM anon, authenticated;
REVOKE ALL ON SEQUENCE workout_exercises_id_seq FROM anon, authenticated;

ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_duration_check;
ALTER TABLE workouts
    ADD CONSTRAINT workouts_duration_check
    CHECK (duration IS NULL OR duration BETWEEN 1 AND 1440);

ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_sets_check;
ALTER TABLE workout_exercises
    ADD CONSTRAINT workout_exercises_sets_check CHECK (sets BETWEEN 1 AND 100);

ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_reps_check;
ALTER TABLE workout_exercises
    ADD CONSTRAINT workout_exercises_reps_check CHECK (reps BETWEEN 1 AND 1000);

ALTER TABLE workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_weight_check;
ALTER TABLE workout_exercises
    ADD CONSTRAINT workout_exercises_weight_check
    CHECK (weight IS NULL OR weight BETWEEN 0 AND 1000);

-- Krijo index për performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Seed exercises data (vetëm nëse tabela është e zbrazët)
INSERT INTO exercises (name, category, muscle, description, image) 
SELECT * FROM (VALUES
    ('Push-ups', 'Chest', 'Chest, Triceps', 'Classic bodyweight exercise for upper body strength', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
    ('Squats', 'Legs', 'Quadriceps, Glutes', 'Fundamental lower body exercise', 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop'),
    ('Pull-ups', 'Back', 'Lats, Biceps', 'Upper body pulling exercise', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop'),
    ('Deadlifts', 'Back', 'Hamstrings, Glutes, Back', 'Compound movement for posterior chain', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop'),
    ('Bench Press', 'Chest', 'Chest, Shoulders, Triceps', 'Classic chest building exercise', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
    ('Plank', 'Core', 'Abs, Core', 'Isometric core strengthening exercise', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
    ('Lunges', 'Legs', 'Quadriceps, Glutes', 'Unilateral leg exercise', 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop'),
    ('Shoulder Press', 'Shoulders', 'Deltoids, Triceps', 'Overhead pressing movement', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop')
) AS v(name, category, muscle, description, image)
WHERE NOT EXISTS (SELECT 1 FROM exercises LIMIT 1);

-- Verifikim
SELECT COUNT(*) as total_exercises FROM exercises;
