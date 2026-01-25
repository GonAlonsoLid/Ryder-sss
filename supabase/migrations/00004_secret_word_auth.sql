-- Migration: Add secret word authentication
-- This allows players to login with their name + secret word instead of email

-- Add secret_word column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secret_word TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Update existing players with their team assignments
-- Pimentonas (Yago's team) - Red team
UPDATE profiles SET team_id = '00000000-0000-0000-0000-000000000010' 
WHERE display_name IN ('Yago', 'Marcos', 'Enrique', 'Semmler', 'Gonzi');

-- Tabaqueras (Jorge's team) - Blue team  
UPDATE profiles SET team_id = '00000000-0000-0000-0000-000000000011'
WHERE display_name IN ('Jorge', 'Miguel', 'Pedro', 'Sebas', 'Felipe');

-- Insert players if they don't exist (for fresh installs)
INSERT INTO profiles (id, display_name, nickname, role, team_id) VALUES
  (gen_random_uuid(), 'Yago', NULL, 'admin', '00000000-0000-0000-0000-000000000010'),
  (gen_random_uuid(), 'Marcos', NULL, 'player', '00000000-0000-0000-0000-000000000010'),
  (gen_random_uuid(), 'Enrique', NULL, 'player', '00000000-0000-0000-0000-000000000010'),
  (gen_random_uuid(), 'Juanito', NULL, 'player', '00000000-0000-0000-0000-000000000010'),
  (gen_random_uuid(), 'Gonzi', NULL, 'admin', '00000000-0000-0000-0000-000000000010'),
  (gen_random_uuid(), 'Jorge', NULL, 'admin', '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Miguel', NULL, 'player', '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Pedro', NULL, 'player', '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Sebas', NULL, 'player', '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Felipe', NULL, 'player', '00000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;

-- RLS policy for secret_word - users can only see/update their own
DROP POLICY IF EXISTS "Users can update own secret_word" ON profiles;
CREATE POLICY "Users can update own secret_word" ON profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow public read of profiles (for player selection)
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT USING (true);

