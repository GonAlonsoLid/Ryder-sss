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

// =====================
// COURSE DATA - VALDECAÑAS (Ambos días: Scramble + Singles)
// =====================
// Par: 72 (18 hoyos)
// Se juega el sábado 31 (Scramble) y domingo 1 (Singles)

export interface HoleInfo {
  hole: number;
  par: number;
  strokeIndex: number; // Handicap index (difficulty ranking 1-18)
  distance: number; // meters
}

export const VALDECANAS_HOLES: HoleInfo[] = [
  { hole: 1,  par: 5, strokeIndex: 17,  distance: 466 },
  { hole: 2,  par: 3, strokeIndex: 3, distance: 207 },
  { hole: 3,  par: 5, strokeIndex: 11, distance: 500 },
  { hole: 4,  par: 4, strokeIndex: 5,  distance: 382 },
  { hole: 5,  par: 4, strokeIndex: 9, distance: 369 },
  { hole: 6,  par: 4, strokeIndex: 15, distance: 364 },
  { hole: 7,  par: 4, strokeIndex: 13,  distance: 383 },
  { hole: 8,  par: 3, strokeIndex: 7,  distance: 178 },
  { hole: 9,  par: 4, strokeIndex: 1,  distance: 414 },
  { hole: 10, par: 4, strokeIndex: 4,  distance: 382 },
  { hole: 11, par: 5, strokeIndex: 10, distance: 471 },
  { hole: 12, par: 5, strokeIndex: 2, distance: 516 },
  { hole: 13, par: 4, strokeIndex: 19,  distance: 309 },
  { hole: 14, par: 4, strokeIndex: 14, distance: 325 },
  { hole: 15, par: 3, strokeIndex: 6, distance: 202 },
  { hole: 16, par: 4, strokeIndex: 8,  distance: 375 },
  { hole: 17, par: 3, strokeIndex: 16, distance: 134 },
  { hole: 18, par: 4, strokeIndex: 12,  distance: 342 },
];

export const VALDECANAS_TOTAL_PAR = VALDECANAS_HOLES.reduce((sum, h) => sum + h.par, 0); // Should be 72

// Helper to get score label relative to par
export function getScoreLabel(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -3) return 'Albatros';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Doble Bogey';
  if (diff >= 3) return `+${diff}`;
  return '';
}

// Helper to get score color class
export function getScoreColor(strokes: number, par: number): string {
  const diff = strokes - par;
  if (diff <= -2) return 'text-yellow-600 bg-yellow-100'; // Eagle or better
  if (diff === -1) return 'text-green-600 bg-green-100'; // Birdie
  if (diff === 0) return 'text-slate-600 bg-slate-100'; // Par
  if (diff === 1) return 'text-orange-600 bg-orange-100'; // Bogey
  if (diff >= 2) return 'text-red-600 bg-red-100'; // Double bogey or worse
  return '';
}

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

