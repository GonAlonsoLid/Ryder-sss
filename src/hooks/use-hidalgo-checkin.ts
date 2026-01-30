'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { SSS_TOURNAMENT_ID, HIDALGO_FOR_DATE_FIRST, HIDALGO_FOR_DATE_LAST } from '@/lib/constants';
import type { HidalgoCheckin } from '@/types/database';

const HIDALGO_PROMPT_HOUR = 10; // A partir de las 10:00 se muestra la pregunta

/** Fecha de ayer en YYYY-MM-DD (la "noche anterior") */
function yesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Si es "mañana" para mostrar el prompt (desde las 10:00) */
function isMorningForPrompt(): boolean {
  const now = new Date();
  return now.getHours() >= HIDALGO_PROMPT_HOUR;
}

export function useHidalgoCheckin(userId: string | undefined) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseClient();

  const check = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const forDate = yesterdayDateStr();
      const { data, error } = await supabase
        .from('hidalgo_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('tournament_id', SSS_TOURNAMENT_ID)
        .eq('for_date', forDate)
        .maybeSingle();

      if (error) {
        setShowPrompt(false);
        setLoading(false);
        return;
      }

      const alreadyAnswered = !!data;
      // Solo mañana y pasado: solo preguntamos si for_date está en el rango (no hoy)
      const forDateInRange = forDate >= HIDALGO_FOR_DATE_FIRST && forDate <= HIDALGO_FOR_DATE_LAST;
      const shouldShow = isMorningForPrompt() && !alreadyAnswered && forDateInRange;
      setShowPrompt(shouldShow);
    } catch {
      setShowPrompt(false);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    check();
  }, [check]);

  const submit = useCallback(
    async (saidYes: boolean) => {
      if (!userId) return;
      setSubmitting(true);
      try {
        const forDate = yesterdayDateStr();
        const { error } = await supabase.from('hidalgo_checkins').upsert(
          {
            user_id: userId,
            tournament_id: SSS_TOURNAMENT_ID,
            for_date: forDate,
            said_yes: saidYes,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,for_date',
          }
        );
        if (error) throw error;
        setShowPrompt(false);
      } catch {
        // Error silencioso o toast
      } finally {
        setSubmitting(false);
      }
    },
    [userId, supabase]
  );

  return { showPrompt, loading, submitting, submit, refetch: check };
}
