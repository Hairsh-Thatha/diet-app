-- Run this against an already-created PostgreSQL database named nutriarc.
-- Safe to rerun for a database where these tables already exist.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  calories integer NOT NULL DEFAULT 2200,
  protein numeric NOT NULL DEFAULT 150,
  carbs numeric NOT NULL DEFAULT 250,
  fat numeric NOT NULL DEFAULT 70,
  water numeric NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snack', 'Dinner')),
  food_name text NOT NULL,
  serving_size text NOT NULL,
  calories numeric NOT NULL CHECK (calories >= 0),
  protein numeric NOT NULL CHECK (protein >= 0),
  carbs numeric NOT NULL CHECK (carbs >= 0),
  fat numeric NOT NULL CHECK (fat >= 0),
  image_url text,
  confidence numeric CHECK (confidence BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS food_user_date_idx ON food_entries(user_id, date);

CREATE TABLE IF NOT EXISTS winter_arc_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS challenge_user_status_idx ON winter_arc_challenges(user_id, status);

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES winter_arc_challenges(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '✓',
  description text,
  type text NOT NULL DEFAULT 'boolean',
  target numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'done',
  frequency text NOT NULL DEFAULT 'daily',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  value numeric NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habit_date_unique UNIQUE (habit_id, date)
);
CREATE INDEX IF NOT EXISTS habit_completion_date_idx ON habit_completions(date);
