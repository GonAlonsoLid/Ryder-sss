-- ===================================================
-- RESET RYDER CUP - Ejecutar en Supabase SQL Editor
-- ===================================================
-- Este script resetea TODOS los datos del torneo
-- pero mantiene la configuración (jugadores, equipos, rondas)
--
-- ⚠️ ADVERTENCIA: Esto borra TODOS los scores, copas, retos, etc.
-- ===================================================

BEGIN;

-- 1. Borrar todas las copas/bebidas
DELETE FROM drinks;

-- 2. Borrar todos los scores hoyo por hoyo
DELETE FROM hole_scores;

-- 3. Borrar historial de actualizaciones de partidos
DELETE FROM match_updates;

-- 4. Borrar feed de eventos
DELETE FROM events_feed;

-- 5. Borrar asignaciones de retos
DELETE FROM challenge_assignments;

-- 6. Resetear todos los partidos a estado inicial
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

-- 7. Resetear rondas (marcar como no completadas)
UPDATE rounds SET
  is_completed = false,
  updated_at = NOW();

-- 8. Resetear puntos de equipos a 0
UPDATE teams SET
  total_points = 0,
  updated_at = NOW();

-- 9. Limpiar ganadores de trofeos (mantener definiciones)
UPDATE trophies SET
  winner_user_id = NULL,
  winner_team_id = NULL,
  updated_at = NOW();

COMMIT;

-- ===================================================
-- VERIFICACIÓN - Debería mostrar todo en 0
-- ===================================================
SELECT 
  '✅ Copas eliminadas' as status, COUNT(*) as count FROM drinks
UNION ALL
SELECT '✅ Scores hoyo por hoyo eliminados', COUNT(*) FROM hole_scores
UNION ALL
SELECT '✅ Match updates eliminados', COUNT(*) FROM match_updates
UNION ALL
SELECT '✅ Eventos eliminados', COUNT(*) FROM events_feed
UNION ALL
SELECT '✅ Retos asignados eliminados', COUNT(*) FROM challenge_assignments
UNION ALL
SELECT '✅ Partidos en estado inicial', COUNT(*) FROM matches WHERE status = 'pending'
UNION ALL
SELECT '✅ Equipos con 0 puntos', COUNT(*) FROM teams WHERE total_points = 0;

