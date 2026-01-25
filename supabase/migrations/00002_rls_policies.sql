-- SSS Ryder Cup - Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_feed ENABLE ROW LEVEL SECURITY;

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is participant in a match
CREATE OR REPLACE FUNCTION is_match_participant(match_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches
        WHERE id = match_uuid
        AND (auth.uid() = ANY(team_a_players) OR auth.uid() = ANY(team_b_players))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- PROFILES POLICIES
-- ================================

-- Everyone can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- TOURNAMENTS POLICIES
-- ================================

-- Everyone can view tournaments
CREATE POLICY "Tournaments are viewable by everyone"
ON tournaments FOR SELECT
TO authenticated
USING (true);

-- Only admins can create tournaments
CREATE POLICY "Admins can create tournaments"
ON tournaments FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update tournaments
CREATE POLICY "Admins can update tournaments"
ON tournaments FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- TEAMS POLICIES
-- ================================

-- Everyone can view teams
CREATE POLICY "Teams are viewable by everyone"
ON teams FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage teams
CREATE POLICY "Admins can manage teams"
ON teams FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- ROUNDS POLICIES
-- ================================

-- Everyone can view rounds
CREATE POLICY "Rounds are viewable by everyone"
ON rounds FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage rounds
CREATE POLICY "Admins can manage rounds"
ON rounds FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- MATCHES POLICIES
-- ================================

-- Everyone can view matches
CREATE POLICY "Matches are viewable by everyone"
ON matches FOR SELECT
TO authenticated
USING (true);

-- Admins can do anything with matches
CREATE POLICY "Admins can manage matches"
ON matches FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Participants can update their matches
CREATE POLICY "Participants can update matches"
ON matches FOR UPDATE
TO authenticated
USING (is_match_participant(id))
WITH CHECK (is_match_participant(id));

-- ================================
-- MATCH UPDATES POLICIES
-- ================================

-- Everyone can view match updates
CREATE POLICY "Match updates are viewable by everyone"
ON match_updates FOR SELECT
TO authenticated
USING (true);

-- Participants and admins can insert updates
CREATE POLICY "Participants can insert match updates"
ON match_updates FOR INSERT
TO authenticated
WITH CHECK (is_match_participant(match_id) OR is_admin());

-- ================================
-- DRINKS POLICIES
-- ================================

-- Everyone can view drinks
CREATE POLICY "Drinks are viewable by everyone"
ON drinks FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own drinks
CREATE POLICY "Users can insert own drinks"
ON drinks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drinks
CREATE POLICY "Users can update own drinks"
ON drinks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own drinks
CREATE POLICY "Users can delete own drinks"
ON drinks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all drinks
CREATE POLICY "Admins can manage all drinks"
ON drinks FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- CHALLENGES POLICIES
-- ================================

-- Everyone can view challenges
CREATE POLICY "Challenges are viewable by everyone"
ON challenges FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage challenges
CREATE POLICY "Admins can manage challenges"
ON challenges FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- CHALLENGE ASSIGNMENTS POLICIES
-- ================================

-- Everyone can view assignments
CREATE POLICY "Assignments are viewable by everyone"
ON challenge_assignments FOR SELECT
TO authenticated
USING (true);

-- Admins can create assignments
CREATE POLICY "Admins can create assignments"
ON challenge_assignments FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Assigned users can update status
CREATE POLICY "Assigned users can update status"
ON challenge_assignments FOR UPDATE
TO authenticated
USING (auth.uid() = assigned_to_user_id)
WITH CHECK (auth.uid() = assigned_to_user_id);

-- Any user can validate (be a witness)
CREATE POLICY "Users can validate assignments"
ON challenge_assignments FOR UPDATE
TO authenticated
USING (validated_by_user_id IS NULL OR validated_by_user_id = auth.uid())
WITH CHECK (true);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments"
ON challenge_assignments FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- TROPHIES POLICIES
-- ================================

-- Everyone can view trophies
CREATE POLICY "Trophies are viewable by everyone"
ON trophies FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage trophies
CREATE POLICY "Admins can manage trophies"
ON trophies FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ================================
-- EVENTS FEED POLICIES
-- ================================

-- Everyone can view events
CREATE POLICY "Events are viewable by everyone"
ON events_feed FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert events
CREATE POLICY "Users can insert events"
ON events_feed FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_user_id);

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
ON events_feed FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

