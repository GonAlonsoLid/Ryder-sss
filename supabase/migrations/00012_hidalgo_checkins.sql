-- Hidalgo matutino: pregunta cada mañana (primera vez que inicia sesión, desde las 10:00)
-- Validación: 1 del mismo equipo + 1 del equipo contrario. Si no está validado: -1 punto al equipo.
-- ================================================================================================

CREATE TABLE hidalgo_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    for_date DATE NOT NULL,
    said_yes BOOLEAN NOT NULL,
    validated_by_same_team_id UUID REFERENCES profiles(id),
    validated_by_opposite_team_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, for_date)
);

CREATE INDEX idx_hidalgo_checkins_tournament_date ON hidalgo_checkins(tournament_id, for_date);
CREATE INDEX idx_hidalgo_checkins_user ON hidalgo_checkins(user_id);

ALTER TABLE hidalgo_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hidalgo_select_all"
ON hidalgo_checkins FOR SELECT
USING (true);

CREATE POLICY "hidalgo_insert_all"
ON hidalgo_checkins FOR INSERT
WITH CHECK (true);

CREATE POLICY "hidalgo_update_all"
ON hidalgo_checkins FOR UPDATE
USING (true)
WITH CHECK (true);

COMMENT ON TABLE hidalgo_checkins IS 'Check-in matutino: ¿te hiciste un hidalgo anoche? Requiere validación de 1 del mismo equipo y 1 del contrario. Sin validar = -1 punto al equipo.';
