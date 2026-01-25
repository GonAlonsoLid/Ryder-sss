-- SSS Ryder Cup - Initial Schema
-- ================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE user_role AS ENUM ('admin', 'player');
CREATE TYPE match_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE match_result AS ENUM ('team_a_win', 'team_b_win', 'draw', 'in_progress');
CREATE TYPE round_format AS ENUM ('foursomes', 'fourball', 'singles', 'scramble');
CREATE TYPE challenge_type AS ENUM ('individual', 'pair', 'team');
CREATE TYPE challenge_status AS ENUM ('assigned', 'completed', 'failed', 'pending');
CREATE TYPE drink_type AS ENUM ('cerveza', 'vino', 'chupito', 'copa', 'agua_fake', 'otro');
CREATE TYPE event_type AS ENUM ('score_update', 'drink', 'challenge_completed', 'challenge_failed', 'trophy_awarded', 'match_started', 'match_completed');

-- ================================
-- PROFILES TABLE
-- ================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'player',
    team_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TOURNAMENTS TABLE
-- ================================
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    location TEXT,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- TEAMS TABLE
-- ================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#000000',
    logo_url TEXT,
    total_points DECIMAL(5,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles for team
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- ================================
-- ROUNDS TABLE
-- ================================
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    round_order INT NOT NULL,
    format round_format NOT NULL,
    date_time TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- MATCHES TABLE
-- ================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
    team_a_players UUID[] NOT NULL,
    team_b_players UUID[] NOT NULL,
    team_a_id UUID REFERENCES teams(id),
    team_b_id UUID REFERENCES teams(id),
    status match_status DEFAULT 'pending',
    result match_result DEFAULT 'in_progress',
    score_display TEXT DEFAULT 'AS', -- AS, 1UP, 2UP, etc.
    holes_played INT DEFAULT 0,
    points_value DECIMAL(3,1) DEFAULT 1,
    team_a_points DECIMAL(3,1) DEFAULT 0,
    team_b_points DECIMAL(3,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- MATCH UPDATES TABLE (Audit log)
-- ================================
CREATE TABLE match_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES profiles(id),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- DRINKS TABLE
-- ================================
CREATE TABLE drinks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    drink_type drink_type NOT NULL,
    count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- CHALLENGES TABLE
-- ================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    challenge_type challenge_type DEFAULT 'individual',
    points_fun INT DEFAULT 1,
    penalty_text TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- CHALLENGE ASSIGNMENTS TABLE
-- ================================
CREATE TABLE challenge_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES profiles(id),
    assigned_to_team_id UUID REFERENCES teams(id),
    status challenge_status DEFAULT 'assigned',
    validated_by_user_id UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ================================
-- TROPHIES TABLE
-- ================================
CREATE TABLE trophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '🏆',
    winner_user_id UUID REFERENCES profiles(id),
    winner_team_id UUID REFERENCES teams(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- EVENTS FEED TABLE
-- ================================
CREATE TABLE events_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    actor_user_id UUID REFERENCES profiles(id),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_rounds_tournament ON rounds(tournament_id);
CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_drinks_user ON drinks(user_id);
CREATE INDEX idx_drinks_tournament ON drinks(tournament_id);
CREATE INDEX idx_challenges_tournament ON challenges(tournament_id);
CREATE INDEX idx_assignments_challenge ON challenge_assignments(challenge_id);
CREATE INDEX idx_assignments_user ON challenge_assignments(assigned_to_user_id);
CREATE INDEX idx_events_tournament ON events_feed(tournament_id);
CREATE INDEX idx_events_created ON events_feed(created_at DESC);

-- ================================
-- FUNCTIONS
-- ================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trophies_updated_at BEFORE UPDATE ON trophies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update team points
CREATE OR REPLACE FUNCTION update_team_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update team A points
    IF NEW.team_a_id IS NOT NULL THEN
        UPDATE teams SET total_points = (
            SELECT COALESCE(SUM(team_a_points), 0)
            FROM matches WHERE team_a_id = NEW.team_a_id
        ) + (
            SELECT COALESCE(SUM(team_b_points), 0)
            FROM matches WHERE team_b_id = NEW.team_a_id
        )
        WHERE id = NEW.team_a_id;
    END IF;
    
    -- Update team B points
    IF NEW.team_b_id IS NOT NULL THEN
        UPDATE teams SET total_points = (
            SELECT COALESCE(SUM(team_a_points), 0)
            FROM matches WHERE team_a_id = NEW.team_b_id
        ) + (
            SELECT COALESCE(SUM(team_b_points), 0)
            FROM matches WHERE team_b_id = NEW.team_b_id
        )
        WHERE id = NEW.team_b_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_points_trigger
AFTER UPDATE ON matches FOR EACH ROW
WHEN (OLD.team_a_points IS DISTINCT FROM NEW.team_a_points OR OLD.team_b_points IS DISTINCT FROM NEW.team_b_points)
EXECUTE FUNCTION update_team_points();

-- ================================
-- ENABLE REALTIME
-- ================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE events_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE drinks;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

