-- Fix RLS for custom auth (no Supabase Auth)
-- ==========================================

-- Como usamos autenticación personalizada sin Supabase Auth,
-- necesitamos actualizar las políticas para permitir operaciones
-- usando la API key anon

-- ================================
-- DRINKS - Eliminar políticas antiguas y crear nuevas
-- ================================

DROP POLICY IF EXISTS "Drinks are viewable by everyone" ON drinks;
DROP POLICY IF EXISTS "Users can insert own drinks" ON drinks;
DROP POLICY IF EXISTS "Users can update own drinks" ON drinks;
DROP POLICY IF EXISTS "Users can delete own drinks" ON drinks;
DROP POLICY IF EXISTS "Admins can manage all drinks" ON drinks;

-- Permitir lectura pública
CREATE POLICY "drinks_select_all"
ON drinks FOR SELECT
USING (true);

-- Permitir inserción a cualquiera (la validación se hace en la app)
CREATE POLICY "drinks_insert_all"
ON drinks FOR INSERT
WITH CHECK (true);

-- Permitir actualización a cualquiera
CREATE POLICY "drinks_update_all"
ON drinks FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir borrado a cualquiera
CREATE POLICY "drinks_delete_all"
ON drinks FOR DELETE
USING (true);

-- ================================
-- EVENTS FEED - Eliminar políticas antiguas y crear nuevas
-- ================================

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events_feed;
DROP POLICY IF EXISTS "Users can insert events" ON events_feed;
DROP POLICY IF EXISTS "Admins can manage events" ON events_feed;

-- Permitir lectura pública
CREATE POLICY "events_select_all"
ON events_feed FOR SELECT
USING (true);

-- Permitir inserción a cualquiera
CREATE POLICY "events_insert_all"
ON events_feed FOR INSERT
WITH CHECK (true);

-- ================================
-- CHALLENGE_ASSIGNMENTS - Actualizar políticas
-- ================================

DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON challenge_assignments;
DROP POLICY IF EXISTS "Admins can create assignments" ON challenge_assignments;
DROP POLICY IF EXISTS "Assigned users can update status" ON challenge_assignments;
DROP POLICY IF EXISTS "Users can validate assignments" ON challenge_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON challenge_assignments;

-- Permitir lectura pública
CREATE POLICY "assignments_select_all"
ON challenge_assignments FOR SELECT
USING (true);

-- Permitir todas las operaciones (validación en app)
CREATE POLICY "assignments_insert_all"
ON challenge_assignments FOR INSERT
WITH CHECK (true);

CREATE POLICY "assignments_update_all"
ON challenge_assignments FOR UPDATE
USING (true)
WITH CHECK (true);

-- ================================
-- MATCHES - Actualizar políticas
-- ================================

DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Admins can manage matches" ON matches;
DROP POLICY IF EXISTS "Participants can update matches" ON matches;

-- Permitir lectura pública
CREATE POLICY "matches_select_all"
ON matches FOR SELECT
USING (true);

-- Permitir actualización a cualquiera
CREATE POLICY "matches_update_all"
ON matches FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir inserción a cualquiera
CREATE POLICY "matches_insert_all"
ON matches FOR INSERT
WITH CHECK (true);

-- ================================
-- MATCH UPDATES - Actualizar políticas
-- ================================

DROP POLICY IF EXISTS "Match updates are viewable by everyone" ON match_updates;
DROP POLICY IF EXISTS "Participants can insert match updates" ON match_updates;

-- Permitir lectura pública
CREATE POLICY "match_updates_select_all"
ON match_updates FOR SELECT
USING (true);

-- Permitir inserción a cualquiera
CREATE POLICY "match_updates_insert_all"
ON match_updates FOR INSERT
WITH CHECK (true);

