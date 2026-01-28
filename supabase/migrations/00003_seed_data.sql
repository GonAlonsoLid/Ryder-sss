-- SSS Ryder Cup - Seed Data
-- ===========================
-- NOTA: Este seed crea el torneo, equipos y rondas.
-- Los profiles se crean cuando los usuarios hacen login con magic link.
-- El ADMIN deberá asignar usuarios a equipos y crear matches reales.

-- ================================
-- TOURNAMENT
-- ================================
INSERT INTO tournaments (id, name, start_date, end_date, location, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SSS Ryder Weekend',
    '2026-01-31',
    '2026-02-01',
    'Valdecañas',
    true
);

-- ================================
-- TEAMS
-- ================================
INSERT INTO teams (id, tournament_id, name, color, logo_url)
VALUES 
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Pimentonas', '#DC2626', '/logos/pimentonas.png'),
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Tabaqueras', '#2563EB', '/logos/tabaqueras.png');

-- ================================
-- ROUNDS
-- ================================
INSERT INTO rounds (id, tournament_id, name, round_order, format, date_time)
VALUES 
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'R1: Scramble', 1, 'scramble', '2026-01-31 09:00:00+01'),
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'R2: Singles 1v1', 2, 'singles', '2026-02-01 09:00:00+01');

-- ================================
-- CHALLENGES (Biblioteca de retos)
-- ================================
INSERT INTO challenges (tournament_id, title, description, challenge_type, points_fun, penalty_text, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'El Predicador', 'Dar un speech motivacional de 1 minuto antes de tu putt', 'individual', 3, 'Penalti: 1 chupito', true),
    ('00000000-0000-0000-0000-000000000001', 'Caddyshack', 'Jugar un hoyo haciendo de caddie para tu compañero', 'pair', 2, 'Penalti: ronda de cervezas', true),
    ('00000000-0000-0000-0000-000000000001', 'El Manos Quietas', 'No tocar tu putter hasta el green durante 3 hoyos', 'individual', 4, 'Penalti: 2 chupitos', true),
    ('00000000-0000-0000-0000-000000000001', 'Happy Gilmore', 'Hacer un approach corriendo como Happy Gilmore', 'individual', 2, 'Penalti: invitas copa', true),
    ('00000000-0000-0000-0000-000000000001', 'El Susurrador', 'Hablar en susurros durante un hoyo completo', 'individual', 2, 'Penalti: 1 chupito', true),
    ('00000000-0000-0000-0000-000000000001', 'Team Spirit', 'Todo el equipo celebra con baile el birdie de cualquier miembro', 'team', 5, 'Penalti: ronda de chupitos al otro equipo', true),
    ('00000000-0000-0000-0000-000000000001', 'El Meteorólogo', 'Antes de cada golpe, dar el parte meteorológico detallado', 'individual', 3, 'Penalti: 1 cerveza', true),
    ('00000000-0000-0000-0000-000000000001', 'El Comentarista', 'Narrar tus propios golpes como comentarista de TV', 'individual', 2, 'Penalti: 1 chupito', true),
    ('00000000-0000-0000-0000-000000000001', 'Zurdo Forzoso', 'Jugar un hoyo con la mano contraria', 'individual', 5, 'Penalti: 2 chupitos', true),
    ('00000000-0000-0000-0000-000000000001', 'El Fotógrafo', 'Hacer pose de campeón tras cada golpe bueno (mínimo 3)', 'individual', 2, 'Penalti: 1 cerveza', true);

-- ================================
-- TROPHIES (Plantillas)
-- ================================
INSERT INTO trophies (tournament_id, title, description, emoji)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'SSS Cup', 'Equipo ganador de la SSS Ryder Weekend', '🏆'),
    ('00000000-0000-0000-0000-000000000001', 'MVP', 'Jugador más valioso del torneo', '⭐'),
    ('00000000-0000-0000-0000-000000000001', 'King of Drinks', 'El rey de la hidratación... con estilo', '🍺'),
    ('00000000-0000-0000-0000-000000000001', 'Challenge Master', 'El que más retos ha completado', '🎯'),
    ('00000000-0000-0000-0000-000000000001', 'Biggest Choker', 'El arte de desaparecer bajo presión', '😱'),
    ('00000000-0000-0000-0000-000000000001', 'El Buen Rollo', 'Mejor actitud y espíritu deportivo', '🤝'),
    ('00000000-0000-0000-0000-000000000001', 'Clutch King', 'Mejor jugador en momentos decisivos', '👑');

-- ================================
-- NOTE: Los matches se crean vacíos (sin players asignados)
-- El ADMIN deberá editar y asignar los jugadores reales una vez
-- que los usuarios se hayan registrado y asignado a equipos.
-- ================================

-- Placeholder matches for Round 1 (Scramble - 1 match por equipos)
INSERT INTO matches (round_id, team_a_players, team_b_players, team_a_id, team_b_id, points_value)
VALUES 
    ('00000000-0000-0000-0000-000000000020', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1);

-- Placeholder matches for Round 2 (Singles 1v1 - 5 matches, uno por jugador)
INSERT INTO matches (round_id, team_a_players, team_b_players, team_a_id, team_b_id, points_value)
VALUES 
    ('00000000-0000-0000-0000-000000000021', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1),
    ('00000000-0000-0000-0000-000000000021', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1),
    ('00000000-0000-0000-0000-000000000021', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1),
    ('00000000-0000-0000-0000-000000000021', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1),
    ('00000000-0000-0000-0000-000000000021', ARRAY[]::UUID[], ARRAY[]::UUID[], '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1);

