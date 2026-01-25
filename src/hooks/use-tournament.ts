'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Tournament, Team, Round, Match, Profile } from '@/types/database';

// ID del torneo SSS Ryder Weekend (del seed)
export const SSS_TOURNAMENT_ID = '00000000-0000-0000-0000-000000000001';

interface TournamentData {
  tournament: Tournament | null;
  teams: Team[];
  rounds: Round[];
  profiles: Profile[];
  isLoading: boolean;
  error: Error | null;
}

export function useTournament() {
  const [data, setData] = useState<TournamentData>({
    tournament: null,
    teams: [],
    rounds: [],
    profiles: [],
    isLoading: true,
    error: null,
  });

  const supabase = getSupabaseClient();

  const fetchTournamentData = useCallback(async () => {
    try {
      const [tournamentRes, teamsRes, roundsRes, profilesRes] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', SSS_TOURNAMENT_ID).single(),
        supabase.from('teams').select('*').eq('tournament_id', SSS_TOURNAMENT_ID).order('name'),
        supabase.from('rounds').select('*').eq('tournament_id', SSS_TOURNAMENT_ID).order('round_order'),
        supabase.from('profiles').select('*'),
      ]);

      if (tournamentRes.error) throw tournamentRes.error;

      setData({
        tournament: tournamentRes.data as Tournament,
        teams: (teamsRes.data || []) as Team[],
        rounds: (roundsRes.data || []) as Round[],
        profiles: (profilesRes.data || []) as Profile[],
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
    fetchTournamentData();
  }, [fetchTournamentData]);

  const refetch = useCallback(() => {
    setData(prev => ({ ...prev, isLoading: true }));
    fetchTournamentData();
  }, [fetchTournamentData]);

  return { ...data, refetch };
}

export function useMatches(roundId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from('matches').select('*');
    
    if (roundId) {
      query = query.eq('round_id', roundId);
    }

    const { data, error } = await query.order('created_at');
    
    if (!error && data) {
      setMatches(data as Match[]);
    }
    setIsLoading(false);
  }, [supabase, roundId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, isLoading, refetch: fetchMatches };
}

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchMatch = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (!error && data) {
        setMatch(data as Match);
      }
      setIsLoading(false);
    };

    if (matchId) {
      fetchMatch();
    }
  }, [supabase, matchId]);

  const updateMatch = useCallback(async (updates: Partial<Match>) => {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (!error && data) {
      setMatch(data as Match);
    }
    return { data, error };
  }, [supabase, matchId]);

  return { match, isLoading, updateMatch };
}

// Helper para obtener jugadores de un equipo
export function getTeamPlayers(profiles: Profile[], teamId: string): Profile[] {
  return profiles.filter(p => p.team_id === teamId);
}
