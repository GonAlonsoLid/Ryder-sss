-- =====================================================
-- MIGRACIÓN 6: Añadir handicaps a los jugadores
-- =====================================================

-- 1. Añadir columna handicap a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS handicap DECIMAL(4,1);

-- 2. Actualizar handicaps de cada jugador
-- Basado en los datos de Golf GameBook

-- Pimentonas (Yago's team)
UPDATE profiles SET handicap = 36.0 WHERE display_name = 'Yago';
UPDATE profiles SET handicap = 30.0 WHERE display_name = 'Marcos';
UPDATE profiles SET handicap = 14.0 WHERE display_name = 'Enrique';
UPDATE profiles SET handicap = 22.4 WHERE display_name = 'Semmler';
UPDATE profiles SET handicap = 27.0 WHERE display_name = 'Gonzi';

-- Tabaqueras (Jorge's team)
UPDATE profiles SET handicap = 50.0 WHERE display_name = 'Jorge';
UPDATE profiles SET handicap = 30.0 WHERE display_name = 'Miguel';
UPDATE profiles SET handicap = 14.0 WHERE display_name = 'Pedro';
UPDATE profiles SET handicap = 22.4 WHERE display_name = 'Sebas';
UPDATE profiles SET handicap = 27.0 WHERE display_name = 'Felipe';

-- 3. Verificar
SELECT display_name, handicap FROM profiles ORDER BY handicap;

