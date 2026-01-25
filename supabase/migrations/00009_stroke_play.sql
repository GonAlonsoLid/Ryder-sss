-- Add stroke play fields to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_strokes INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_strokes INTEGER DEFAULT 0;

-- For stroke play, score_display will show "72 - 75" format
-- The existing matchplay fields continue to work for scramble

