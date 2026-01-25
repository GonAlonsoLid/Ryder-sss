'use client';

import { useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

type TableName = 'matches' | 'events_feed' | 'drinks' | 'challenge_assignments' | 'teams';

interface UseRealtimeOptions<T> {
  table: TableName;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const supabase = getSupabaseClient();

  const handleChanges = useCallback(
    (payload: { eventType: string; new: T; old: T }) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new);
          break;
        case 'UPDATE':
          onUpdate?.(payload.new);
          break;
        case 'DELETE':
          onDelete?.(payload.old);
          break;
      }
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes' as 'system',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        } as unknown as { event: 'system' },
        handleChanges as unknown as () => void
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, filter, enabled, handleChanges]);
}

// Hook específico para el feed de eventos
export function useEventsFeed(
  tournamentId: string,
  onNewEvent: (event: Record<string, unknown>) => void
) {
  useRealtime({
    table: 'events_feed',
    filter: `tournament_id=eq.${tournamentId}`,
    onInsert: onNewEvent,
    enabled: !!tournamentId,
  });
}

// Hook específico para matches
export function useMatchUpdates(
  onMatchUpdate: (match: Record<string, unknown>) => void
) {
  useRealtime({
    table: 'matches',
    onUpdate: onMatchUpdate,
  });
}
