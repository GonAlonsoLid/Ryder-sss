'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Users } from 'lucide-react';
import { SSS_TOURNAMENT_ID, DRINK_EMOJIS, HIDALGO_FOR_DATE_FIRST, HIDALGO_FOR_DATE_LAST } from '@/lib/constants';
import type { HidalgoCheckin } from '@/types/database';
import type { Profile } from '@/types/database';

interface CheckinWithProfile extends HidalgoCheckin {
  profile?: Profile;
}

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isWithinValidationDeadline(forDateStr: string): boolean {
  const forDate = new Date(forDateStr + 'T12:00:00Z');
  const deadline = new Date(forDate);
  deadline.setUTCDate(deadline.getUTCDate() + 1);
  const today = new Date(todayDateStr() + 'T12:00:00Z');
  return today <= deadline;
}

function isHidalgoDateActive(forDateStr: string): boolean {
  return forDateStr >= HIDALGO_FOR_DATE_FIRST && forDateStr <= HIDALGO_FOR_DATE_LAST;
}

export default function HidalgoPage() {
  const { player, isLoading: authLoading } = useSimpleAuth();
  const { profiles, isLoading: tournamentLoading } = useTournament();
  const [checkins, setCheckins] = useState<CheckinWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hidalgo_checkins')
        .select('*')
        .eq('tournament_id', SSS_TOURNAMENT_ID)
        .eq('said_yes', true)
        .order('for_date', { ascending: false });

      if (error) throw error;

      const list = (data || []) as HidalgoCheckin[];
      const withProfiles = list.map((c) => ({
        ...c,
        profile: profiles.find((p) => p.id === c.user_id),
      })) as CheckinWithProfile[];

      const pending = withProfiles.filter(
        (c) =>
          isHidalgoDateActive(c.for_date) &&
          isWithinValidationDeadline(c.for_date) &&
          (c.validated_by_same_team_id == null || c.validated_by_opposite_team_id == null)
      );
      setCheckins(pending);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar validaciones');
    } finally {
      setLoading(false);
    }
  }, [supabase, profiles]);

  useEffect(() => {
    if (!tournamentLoading) {
      fetchCheckins();
    }
  }, [fetchCheckins, tournamentLoading]);

  const handleValidate = async (
    checkinId: string,
    field: 'validated_by_same_team_id' | 'validated_by_opposite_team_id'
  ) => {
    if (!player) return;
    setValidatingId(checkinId);
    try {
      const { error } = await supabase
        .from('hidalgo_checkins')
        .update({ [field]: player.id, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', checkinId);

      if (error) throw error;
      toast.success('Validado');
      fetchCheckins();
    } catch {
      toast.error('Error al validar');
    } finally {
      setValidatingId(null);
    }
  };

  const isLoading = authLoading || tournamentLoading;

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  const myTeamId = player?.team_id;

  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>{DRINK_EMOJIS.hidalgo ?? '🫗'}</span>
          Validar Hidalgo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quien dijo que se hizo un hidalgo anoche necesita que valide una persona de su equipo y otra del equipo contrario. Si no está validado a tiempo, su equipo pierde 1 punto.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : checkins.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay hidalgos pendientes de validar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {checkins.map((c) => {
            const profile = c.profile;
            const name = profile?.nickname || profile?.display_name || '?';
            const theirTeamId = profile?.team_id;
            const isSameTeam = theirTeamId === myTeamId;
            const needsSameTeam = c.validated_by_same_team_id == null;
            const needsOppositeTeam = c.validated_by_opposite_team_id == null;
            const canValidateSame = isSameTeam && needsSameTeam && myTeamId != null;
            const canValidateOpposite = !isSameTeam && needsOppositeTeam && myTeamId != null;

            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Noche del {new Date(c.for_date + 'T12:00:00Z').toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {needsSameTeam ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Falta validación de su equipo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Su equipo
                          </Badge>
                        )}
                        {needsOppositeTeam ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Falta validación del otro equipo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Otro equipo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canValidateSame && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleValidate(c.id, 'validated_by_same_team_id')}
                          disabled={validatingId === c.id}
                        >
                          {validatingId === c.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Validar (mi equipo)</>
                          )}
                        </Button>
                      )}
                      {canValidateOpposite && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleValidate(c.id, 'validated_by_opposite_team_id')}
                          disabled={validatingId === c.id}
                        >
                          {validatingId === c.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Validar (equipo contrario)</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
