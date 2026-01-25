// SSS Ryder Cup - Constants
// ==========================

export const SSS_TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001';
export const TEAM_JORGE_ID = '00000000-0000-0000-0000-000000000010';
export const TEAM_YAGO_ID = '00000000-0000-0000-0000-000000000011';

// Player names (for reference)
export const TEAM_JORGE_PLAYERS = ['Jorge', 'Miguel', 'Pedro', 'Sebas', 'Felipe'];
export const TEAM_YAGO_PLAYERS = ['Yago', 'Marcos', 'Enrique', 'Semmler', 'Gonzi'];

// =====================
// SISTEMA DE PUNTUACIÓN
// =====================
// Golf: 1 punto por match ganado, 0.5 por empate
// Bebidas: 0.1 puntos por bebida (¡a hidratarse!)
// Retos: variable según el reto (por defecto 0.5)

export const POINTS_PER_MATCH_WIN = 1;
export const POINTS_PER_MATCH_DRAW = 0.5;
export const POINTS_PER_DRINK = 0.1; // Default fallback

// Puntos por tipo de bebida
export const DRINK_POINTS: Record<string, number> = {
  cerveza: 0.1,
  chupito: 0.2,
  copa: 0.5,
  hidalgo: 0.7,
};
export const POINTS_PER_CHALLENGE_DEFAULT = 0.5;

// Drink emojis
export const DRINK_EMOJIS: Record<string, string> = {
  cerveza: '🍺',
  chupito: '🥃',
  copa: '🍸',
  hidalgo: '🫗',
};

// Drink labels
export const DRINK_LABELS: Record<string, string> = {
  cerveza: 'Cerveza',
  chupito: 'Chupito',
  copa: 'Copa',
  hidalgo: 'Hidalgo',
};

// Match result labels
export const MATCH_RESULT_LABELS: Record<string, string> = {
  team_a_win: 'Victoria',
  team_b_win: 'Derrota',
  draw: 'Empate',
  in_progress: 'En juego',
};

// Match status labels
export const MATCH_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En juego',
  completed: 'Finalizado',
};

// Round format labels
export const ROUND_FORMAT_LABELS: Record<string, string> = {
  foursomes: 'Foursomes',
  fourball: 'Fourball',
  singles: 'Singles',
  scramble: 'Scramble',
};

// Round format descriptions
export const ROUND_FORMAT_DESCRIPTIONS: Record<string, string> = {
  foursomes: 'Parejas alternando golpes con una sola bola',
  fourball: 'Parejas con mejor bola de cada uno',
  singles: 'Enfrentamientos 1 vs 1',
  scramble: 'Todos los jugadores del equipo juegan desde la mejor posición',
};

// Challenge status labels
export const CHALLENGE_STATUS_LABELS: Record<string, string> = {
  assigned: 'Asignado',
  completed: 'Completado',
  failed: 'Fallido',
  pending: 'Pendiente',
};

// Challenge type labels
export const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  pair: 'Pareja',
  team: 'Equipo',
};

// Event type labels
export const EVENT_TYPE_LABELS: Record<string, string> = {
  score_update: 'Actualización de marcador',
  drink: 'Bebida registrada',
  challenge_completed: 'Reto completado',
  challenge_failed: 'Reto fallido',
  trophy_awarded: 'Trofeo otorgado',
  match_started: 'Partido iniciado',
  match_completed: 'Partido finalizado',
};

// Navigation items
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'home' },
  { href: '/tournament', label: 'Torneo', icon: 'trophy' },
  { href: '/leaderboards', label: 'Ranking', icon: 'bar-chart' },
  { href: '/drinks', label: 'Copas', icon: 'beer' },
  { href: '/challenges', label: 'Retos', icon: 'target' },
];

// Matchplay score display helper
export function getMatchplayScore(
  teamAUp: number,
  holesPlayed: number,
  holesRemaining: number
): string {
  if (teamAUp === 0) return 'AS'; // All Square
  
  const up = Math.abs(teamAUp);
  const leader = teamAUp > 0 ? 'A' : 'B';
  
  if (holesRemaining === 0) {
    return `${up}&0`; // Match over
  }
  
  if (up > holesRemaining) {
    return `${up}&${holesRemaining}`; // Match over before 18
  }
  
  return `${up}UP`;
}

// Format helpers
export function formatDateShort(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTimeShort(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
}

