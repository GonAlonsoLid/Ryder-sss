-- Reset Tournament Data - Keep Configuration Only
-- ===================================================
-- This script resets all game data but keeps:
-- - Profiles (players)
-- - Teams
-- - Rounds
-- - Tournament
-- - Challenges (definitions)
-- - Trophies (definitions)
--
-- It removes:
-- - All drinks
-- - All match scores and updates
-- - All hole-by-hole scores
-- - All events feed
-- - All challenge assignments
-- - All trophy winners

BEGIN;

-- 1. Delete all drinks
DELETE FROM drinks;

-- 2. Delete all hole-by-hole scores
DELETE FROM hole_scores;

-- 3. Delete all match updates (audit log)
DELETE FROM match_updates;

-- 4. Delete all events feed
DELETE FROM events_feed;

-- 5. Delete all challenge assignments
DELETE FROM challenge_assignments;

-- 6. Reset all matches to initial state
UPDATE matches SET
  status = 'pending',
  result = 'in_progress',
  score_display = 'AS',
  holes_played = 0,
  team_a_points = 0,
  team_b_points = 0,
  team_a_strokes = 0,
  team_b_strokes = 0,
  updated_at = NOW();

-- 7. Reset rounds to not completed
UPDATE rounds SET
  is_completed = false,
  updated_at = NOW();

-- 8. Reset team total points
UPDATE teams SET
  total_points = 0,
  updated_at = NOW();

-- 9. Clear trophy winners (keep trophy definitions)
UPDATE trophies SET
  winner_user_id = NULL,
  winner_team_id = NULL,
  updated_at = NOW();

COMMIT;

-- Verify reset
SELECT 
  'Drinks' as table_name, COUNT(*) as remaining_count FROM drinks
UNION ALL
SELECT 'Hole Scores', COUNT(*) FROM hole_scores
UNION ALL
SELECT 'Match Updates', COUNT(*) FROM match_updates
UNION ALL
SELECT 'Events Feed', COUNT(*) FROM events_feed
UNION ALL
SELECT 'Challenge Assignments', COUNT(*) FROM challenge_assignments
UNION ALL
SELECT 'Matches (pending)', COUNT(*) FROM matches WHERE status = 'pending'
UNION ALL
SELECT 'Teams (points=0)', COUNT(*) FROM teams WHERE total_points = 0;

