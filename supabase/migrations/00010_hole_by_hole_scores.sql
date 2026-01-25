-- Create table for hole-by-hole scores
CREATE TABLE IF NOT EXISTS hole_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  player_id UUID NOT NULL REFERENCES profiles(id),
  strokes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, hole_number, player_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hole_scores_match ON hole_scores(match_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_player ON hole_scores(player_id);

-- Enable RLS
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow all authenticated users
CREATE POLICY "Anyone can read hole_scores" ON hole_scores FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert hole_scores" ON hole_scores FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update hole_scores" ON hole_scores FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete hole_scores" ON hole_scores FOR DELETE TO public USING (true);

