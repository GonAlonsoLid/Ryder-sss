'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { 
  SSS_TOURNAMENT_ID, 
  TEAM_JORGE_ID, 
  TEAM_YAGO_ID,
  POINTS_PER_MATCH_WIN,
  POINTS_PER_MATCH_DRAW,
  POINTS_PER_DRINK,
  DRINK_POINTS,
  POINTS_PER_CHALLENGE_DEFAULT,
} from '@/lib/constants';
import type { Match, Drink, ChallengeAssignment, Profile, Challenge, HidalgoCheckin } from '@/types/database';

const HIDALGO_PENALTY = 1;
const HIDALGO_VALIDATION_DEADLINE_DAYS = 1; // Tienen hasta el día siguiente a for_date para validar

export interface TeamScoreBreakdown {
  teamId: string;
  teamName: string;
  golf: number;
  drinks: number;
  challenges: number;
  hidalgoPenalty: number;
  total: number;
  // Detalles
  matchesWon: number;
  matchesDrawn: number;
  totalDrinks: number;
  challengesCompleted: number;
}

export interface TeamScoresData {
  pimentonas: TeamScoreBreakdown;
  tabaqueras: TeamScoreBreakdown;
  isLoading: boolean;
  error: Error | null;
}

export function useTeamScores() {
  const [data, setData] = useState<TeamScoresData>({
    pimentonas: createEmptyBreakdown(TEAM_JORGE_ID, 'Pimentonas'),
    tabaqueras: createEmptyBreakdown(TEAM_YAGO_ID, 'Tabaqueras'),
    isLoading: true,
    error: null,
  });

  const supabase = getSupabaseClient();

  const fetchScores = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [matchesRes, drinksRes, challengesRes, assignmentsRes, profilesRes, hidalgoRes] = await Promise.all([
        supabase.from('matches').select('*'),
        supabase.from('drinks').select('*').eq('tournament_id', SSS_TOURNAMENT_ID),
        supabase.from('challenges').select('*').eq('tournament_id', SSS_TOURNAMENT_ID),
        supabase.from('challenge_assignments').select('*').eq('status', 'completed'),
        supabase.from('profiles').select('*'),
        supabase.from('hidalgo_checkins').select('*').eq('tournament_id', SSS_TOURNAMENT_ID),
      ]);

      const matches = (matchesRes.data || []) as Match[];
      const drinks = (drinksRes.data || []) as Drink[];
      const challenges = (challengesRes.data || []) as Challenge[];
      const assignments = (assignmentsRes.data || []) as ChallengeAssignment[];
      const profiles = (profilesRes.data || []) as Profile[];
      const hidalgoCheckins = (hidalgoRes.data || []) as HidalgoCheckin[];

      // Calculate Golf Points
      const golfJorge = calculateGolfPoints(matches, TEAM_JORGE_ID);
      const golfYago = calculateGolfPoints(matches, TEAM_YAGO_ID);

      // Calculate Drink Points (by team)
      const drinksJorge = calculateDrinkPoints(drinks, profiles, TEAM_JORGE_ID);
      const drinksYago = calculateDrinkPoints(drinks, profiles, TEAM_YAGO_ID);

      // Calculate Challenge Points
      const challengesJorge = calculateChallengePoints(assignments, challenges, profiles, TEAM_JORGE_ID);
      const challengesYago = calculateChallengePoints(assignments, challenges, profiles, TEAM_YAGO_ID);

      // Hidalgo penalty: -1 por check-in "said_yes" no validado (falta mismo equipo o contrario)
      const hidalgoPenaltyJorge = calculateHidalgoPenalty(hidalgoCheckins, profiles, TEAM_JORGE_ID);
      const hidalgoPenaltyYago = calculateHidalgoPenalty(hidalgoCheckins, profiles, TEAM_YAGO_ID);

      const totalJorge = golfJorge.points + drinksJorge.points + challengesJorge.points - hidalgoPenaltyJorge;
      const totalYago = golfYago.points + drinksYago.points + challengesYago.points - hidalgoPenaltyYago;

      setData({
        pimentonas: {
          teamId: TEAM_JORGE_ID,
          teamName: 'Pimentonas',
          golf: golfJorge.points,
          drinks: drinksJorge.points,
          challenges: challengesJorge.points,
          hidalgoPenalty: hidalgoPenaltyJorge,
          total: totalJorge,
          matchesWon: golfJorge.won,
          matchesDrawn: golfJorge.drawn,
          totalDrinks: drinksJorge.count,
          challengesCompleted: challengesJorge.count,
        },
        tabaqueras: {
          teamId: TEAM_YAGO_ID,
          teamName: 'Tabaqueras',
          golf: golfYago.points,
          drinks: drinksYago.points,
          challenges: challengesYago.points,
          hidalgoPenalty: hidalgoPenaltyYago,
          total: totalYago,
          matchesWon: golfYago.won,
          matchesDrawn: golfYago.drawn,
          totalDrinks: drinksYago.count,
          challengesCompleted: challengesYago.count,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchScores();

    // Subscribe to realtime changes
    const matchesSubscription = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchScores)
      .subscribe();

    const drinksSubscription = supabase
      .channel('drinks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drinks' }, fetchScores)
      .subscribe();

    const challengesSubscription = supabase
      .channel('challenges-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_assignments' }, fetchScores)
      .subscribe();

    const hidalgoSubscription = supabase
      .channel('hidalgo-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hidalgo_checkins' }, fetchScores)
      .subscribe();

    return () => {
      matchesSubscription.unsubscribe();
      drinksSubscription.unsubscribe();
      challengesSubscription.unsubscribe();
      hidalgoSubscription.unsubscribe();
    };
  }, [supabase, fetchScores]);

  return { ...data, refetch: fetchScores };
}

// Helper functions
function createEmptyBreakdown(teamId: string, teamName: string): TeamScoreBreakdown {
  return {
    teamId,
    teamName,
    golf: 0,
    drinks: 0,
    challenges: 0,
    hidalgoPenalty: 0,
    total: 0,
    matchesWon: 0,
    matchesDrawn: 0,
    totalDrinks: 0,
    challengesCompleted: 0,
  };
}

function calculateGolfPoints(matches: Match[], teamId: string): { points: number; won: number; drawn: number } {
  let points = 0;
  let won = 0;
  let drawn = 0;

  for (const match of matches) {
    if (match.status !== 'completed') continue;

    const isTeamA = match.team_a_id === teamId;
    const isTeamB = match.team_b_id === teamId;

    if (!isTeamA && !isTeamB) continue;

    if (match.result === 'draw') {
      points += POINTS_PER_MATCH_DRAW;
      drawn++;
    } else if (
      (match.result === 'team_a_win' && isTeamA) ||
      (match.result === 'team_b_win' && isTeamB)
    ) {
      points += POINTS_PER_MATCH_WIN;
      won++;
    }
  }

  return { points, won, drawn };
}

function calculateDrinkPoints(drinks: Drink[], profiles: Profile[], teamId: string): { points: number; count: number } {
  // Get all user IDs from this team
  const teamUserIds = new Set(profiles.filter(p => p.team_id === teamId).map(p => p.id));
  
  let count = 0;
  let points = 0;
  
  for (const drink of drinks) {
    if (teamUserIds.has(drink.user_id)) {
      count += drink.count;
      // Puntos según el tipo de bebida
      const drinkPoints = DRINK_POINTS[drink.drink_type] ?? POINTS_PER_DRINK;
      points += drink.count * drinkPoints;
    }
  }

  return { points, count };
}

function calculateChallengePoints(
  assignments: ChallengeAssignment[], 
  challenges: Challenge[],
  profiles: Profile[], 
  teamId: string
): { points: number; count: number } {
  // Get all user IDs from this team
  const teamUserIds = new Set(profiles.filter(p => p.team_id === teamId).map(p => p.id));
  
  let points = 0;
  let count = 0;

  for (const assignment of assignments) {
    // Check if assigned to a user from this team
    const isUserFromTeam = assignment.assigned_to_user_id && teamUserIds.has(assignment.assigned_to_user_id);
    // Check if assigned to this team directly
    const isTeamAssignment = assignment.assigned_to_team_id === teamId;

    if (isUserFromTeam || isTeamAssignment) {
      const challenge = challenges.find(c => c.id === assignment.challenge_id);
      points += challenge?.points_fun ?? POINTS_PER_CHALLENGE_DEFAULT;
      count++;
    }
  }

  return { points, count };
}

/** Fecha de hoy en YYYY-MM-DD (solo fecha, sin hora) */
function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Si el check-in ya pasó el plazo de validación (día siguiente a for_date) */
function isPastValidationDeadline(forDateStr: string): boolean {
  const forDate = new Date(forDateStr + 'T12:00:00Z');
  const deadline = new Date(forDate);
  deadline.setUTCDate(deadline.getUTCDate() + HIDALGO_VALIDATION_DEADLINE_DAYS);
  const today = new Date(todayDateStr() + 'T12:00:00Z');
  return today > deadline;
}

function calculateHidalgoPenalty(
  checkins: HidalgoCheckin[],
  profiles: Profile[],
  teamId: string
): number {
  const teamUserIds = new Set(profiles.filter(p => p.team_id === teamId).map(p => p.id));
  let penalty = 0;
  for (const c of checkins) {
    if (!c.said_yes) continue;
    if (!teamUserIds.has(c.user_id)) continue;
    if (c.validated_by_same_team_id && c.validated_by_opposite_team_id) continue;
    if (!isPastValidationDeadline(c.for_date)) continue;
    penalty += HIDALGO_PENALTY;
  }
  return penalty;
}

