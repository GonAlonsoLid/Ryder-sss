'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const SESSION_KEY = 'sss_ryder_session';

interface Session {
  odPlayerId: string;
  timestamp: number;
}

interface AuthState {
  player: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useSimpleAuth() {
  const [state, setState] = useState<AuthState>({
    player: null,
    isLoading: true,
    isAdmin: false,
  });

  const supabase = getSupabaseClient();

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) {
        setState({ player: null, isLoading: false, isAdmin: false });
        return;
      }

      const session: Session = JSON.parse(sessionStr);
      
      // Session expires after 30 days
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - session.timestamp > thirtyDays) {
        localStorage.removeItem(SESSION_KEY);
        setState({ player: null, isLoading: false, isAdmin: false });
        return;
      }

      // Fetch player profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.odPlayerId)
        .single();

      if (error || !data) {
        localStorage.removeItem(SESSION_KEY);
        setState({ player: null, isLoading: false, isAdmin: false });
        return;
      }

      setState({
        player: data as Profile,
        isLoading: false,
        isAdmin: (data as Profile).role === 'admin',
      });
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setState({ player: null, isLoading: false, isAdmin: false });
    }
  }, [supabase]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login with player ID and secret word
  const login = useCallback(async (playerId: string, secretWord: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error || !data) {
        return { success: false, error: 'Jugador no encontrado' };
      }

      const profile = data as Profile;

      // Check if this is first time (no secret word set)
      if (!profile.secret_word) {
        // First time login - set the secret word
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ secret_word: secretWord } as Record<string, unknown>)
          .eq('id', playerId);

        if (updateError) {
          return { success: false, error: 'Error al guardar la palabra secreta' };
        }
      } else {
        // Check if secret word matches
        if (profile.secret_word !== secretWord) {
          return { success: false, error: 'Palabra secreta incorrecta' };
        }
      }

      // Create session
      const session: Session = {
        odPlayerId: playerId,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // Refetch profile to get updated data
      const { data: updatedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single();

      const updatedProfile = updatedData as Profile;

      setState({
        player: updatedProfile,
        isLoading: false,
        isAdmin: updatedProfile.role === 'admin',
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }, [supabase]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ player: null, isLoading: false, isAdmin: false });
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!state.player) {
      return { success: false, error: 'No hay sesión activa' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as Record<string, unknown>)
        .eq('id', state.player.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Refetch profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.player.id)
        .single();

      if (data) {
        setState(prev => ({
          ...prev,
          player: data as Profile,
        }));
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }, [supabase, state.player]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!state.player) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', state.player.id)
      .single();

    if (data) {
      setState(prev => ({
        ...prev,
        player: data as Profile,
        isAdmin: (data as Profile).role === 'admin',
      }));
    }
  }, [supabase, state.player]);

  return {
    player: state.player,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    isAuthenticated: !!state.player,
    login,
    logout,
    updateProfile,
    refreshProfile,
  };
}

// Get all available players for selection
export async function getAvailablePlayers() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, team_id, nickname, secret_word, handicap')
    .order('display_name');

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return (data || []) as Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'team_id' | 'nickname' | 'secret_word' | 'handicap'>[];
}

