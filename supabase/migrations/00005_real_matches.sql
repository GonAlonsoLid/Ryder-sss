-- =====================================================
-- MIGRACIÓN 5: Partidos reales del SSS Ryder Weekend
-- =====================================================

-- Primero limpiamos los matches dummy existentes
DELETE FROM match_updates;
DELETE FROM matches;

-- IDs de jugadores (los que ya existen en 00004)
-- Pimentonas (Yago's team - AZUL) - team_id: 00000000-0000-0000-0000-000000000010
-- Yago:    11111111-1111-1111-1111-111111111101
-- Marcos:  11111111-1111-1111-1111-111111111102
-- Enrique: 11111111-1111-1111-1111-111111111103
-- Semmler: 11111111-1111-1111-1111-111111111104
-- Gonzi:   11111111-1111-1111-1111-111111111105

-- Tabaqueras (Jorge's team - ROJO) - team_id: 00000000-0000-0000-0000-000000000011
-- Jorge:   11111111-1111-1111-1111-111111111201
-- Miguel:  11111111-1111-1111-1111-111111111202
-- Pedro:   11111111-1111-1111-1111-111111111203
-- Sebas:   11111111-1111-1111-1111-111111111204
-- Felipe:  11111111-1111-1111-1111-111111111205

-- IDs de rondas (de 00003_seed_data.sql)
-- R1 Scramble: 00000000-0000-0000-0000-000000000100
-- R2 Singles:  00000000-0000-0000-0000-000000000101

-- =====================================================
-- RONDA 1: SCRAMBLE (Sábado) - Parejas mixtas, mejor bola
-- Cada pareja juega junta (un jugador de cada equipo)
-- =====================================================

-- Match 1: Pedro + Enrique (Scramble)
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000100',
  ARRAY['11111111-1111-1111-1111-111111111203']::uuid[], -- Pedro (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111103']::uuid[], -- Enrique (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 2: Felipe + Gonzi (Scramble)
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '00000000-0000-0000-0000-000000000100',
  ARRAY['11111111-1111-1111-1111-111111111205']::uuid[], -- Felipe (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111105']::uuid[], -- Gonzi (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 3: Sebas + Semmler (Scramble)
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '00000000-0000-0000-0000-000000000100',
  ARRAY['11111111-1111-1111-1111-111111111204']::uuid[], -- Sebas (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111104']::uuid[], -- Semmler (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 4: Miguel + Marcos (Scramble)
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222204',
  '00000000-0000-0000-0000-000000000100',
  ARRAY['11111111-1111-1111-1111-111111111202']::uuid[], -- Miguel (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111102']::uuid[], -- Marcos (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 5: Jorge + Yago (Scramble) - Los capitanes!
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222205',
  '00000000-0000-0000-0000-000000000100',
  ARRAY['11111111-1111-1111-1111-111111111201']::uuid[], -- Jorge (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111101']::uuid[], -- Yago (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- =====================================================
-- RONDA 2: SINGLES (Domingo) - 1v1 Matchplay
-- Tabaqueras vs Pimentonas
-- =====================================================

-- Match 1: Pedro vs Enrique
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222301',
  '00000000-0000-0000-0000-000000000101',
  ARRAY['11111111-1111-1111-1111-111111111203']::uuid[], -- Pedro (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111103']::uuid[], -- Enrique (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 2: Felipe vs Gonzi
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222302',
  '00000000-0000-0000-0000-000000000101',
  ARRAY['11111111-1111-1111-1111-111111111205']::uuid[], -- Felipe (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111105']::uuid[], -- Gonzi (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 3: Sebas vs Semmler
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222303',
  '00000000-0000-0000-0000-000000000101',
  ARRAY['11111111-1111-1111-1111-111111111204']::uuid[], -- Sebas (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111104']::uuid[], -- Semmler (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 4: Miguel vs Marcos
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222304',
  '00000000-0000-0000-0000-000000000101',
  ARRAY['11111111-1111-1111-1111-111111111202']::uuid[], -- Miguel (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111102']::uuid[], -- Marcos (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- Match 5: Jorge vs Yago - El partido de los capitanes!
INSERT INTO matches (id, round_id, team_a_players, team_b_players, status, result, points_value, team_a_points, team_b_points)
VALUES (
  '22222222-2222-2222-2222-222222222305',
  '00000000-0000-0000-0000-000000000101',
  ARRAY['11111111-1111-1111-1111-111111111201']::uuid[], -- Jorge (Tabaqueras)
  ARRAY['11111111-1111-1111-1111-111111111101']::uuid[], -- Yago (Pimentonas)
  'pending',
  NULL,
  1,
  0,
  0
);

-- =====================================================
-- Actualizar los logos de los equipos
-- =====================================================
UPDATE teams SET logo_url = '/logos/pimentonas.png' WHERE id = '00000000-0000-0000-0000-000000000010';
UPDATE teams SET logo_url = '/logos/tabaqueras.png' WHERE id = '00000000-0000-0000-0000-000000000011';

-- =====================================================
-- Verificación
-- =====================================================
-- SELECT 'Matches creados:' as info, count(*) FROM matches;
-- SELECT r.name, count(m.id) as matches FROM rounds r LEFT JOIN matches m ON m.round_id = r.id GROUP BY r.name;

