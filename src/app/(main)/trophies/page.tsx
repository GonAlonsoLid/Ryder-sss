'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useTournament } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Crown, Award } from 'lucide-react';
import { SSS_TOURNAMENT_ID, TEAM_JORGE_ID } from '@/lib/constants';
import type { Trophy as TrophyType, Profile, Team } from '@/types/database';

interface TrophyWithWinner extends TrophyType {
  winner_user?: Profile;
  winner_team?: Team;
}

interface TrophyRow {
  id: string;
  tournament_id: string;
  title: string;
  description: string | null;
  emoji: string;
  winner_user_id: string | null;
  winner_team_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function TrophiesPage() {
  const { teams, profiles, isLoading: tournamentLoading } = useTournament();
  const [trophies, setTrophies] = useState<TrophyWithWinner[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const supabase = getSupabaseClient();

  const fetchTrophies = useCallback(async () => {
    setDataLoading(true);
    try {
      const { data } = await supabase
        .from('trophies')
        .select('*')
        .eq('tournament_id', SSS_TOURNAMENT_ID)
        .order('created_at');

      if (data) {
        const trophiesWithWinners = (data as TrophyRow[]).map(t => ({
          ...t,
          winner_user: profiles.find(p => p.id === t.winner_user_id),
          winner_team: teams.find(team => team.id === t.winner_team_id),
        }));
        setTrophies(trophiesWithWinners);
      }
    } catch (error) {
      console.error('Error fetching trophies:', error);
    } finally {
      setDataLoading(false);
    }
  }, [supabase, profiles, teams]);

  useEffect(() => {
    if (!tournamentLoading) {
      fetchTrophies();
    }
  }, [fetchTrophies, tournamentLoading]);

  if (tournamentLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  const awardedTrophies = trophies.filter(t => t.winner_user_id || t.winner_team_id);
  const pendingTrophies = trophies.filter(t => !t.winner_user_id && !t.winner_team_id);

  return (
    <PageContainer className="space-y-6">
      <div className="text-center">
        <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold">Vitrina de Trofeos</h1>
        <p className="text-muted-foreground">SSS Ryder Weekend 2026</p>
      </div>

      {/* Main Trophy - SSS Cup */}
      <Card className="bg-gradient-to-br from-yellow-500/20 via-background to-background border-yellow-500/30">
        <CardContent className="py-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 flex items-center justify-center border-4 border-yellow-500/50">
              <span className="text-5xl">🏆</span>
            </div>
            <h2 className="text-xl font-bold">SSS Cup</h2>
            <p className="text-sm text-muted-foreground mb-4">
              El equipo ganador de la SSS Ryder Weekend
            </p>
            {teams[0] && (
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: '#DC2626' }}
                  >
                    {teams.find(t => t.id === TEAM_JORGE_ID)?.total_points || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Pimentonas</p>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="text-center">
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: '#2563EB' }}
                  >
                    {teams.find(t => t.id !== TEAM_JORGE_ID)?.total_points || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Tabaqueras</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Awarded Trophies */}
      {awardedTrophies.length > 0 && (
        <>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Trofeos Entregados
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {awardedTrophies.map((trophy) => {
              const isTeamJorge = trophy.winner_user?.team_id === TEAM_JORGE_ID || 
                                  trophy.winner_team?.id === TEAM_JORGE_ID;
              
              return (
                <Card 
                  key={trophy.id}
                  className="overflow-hidden"
                  style={{ 
                    borderColor: isTeamJorge ? '#DC262640' : '#2563EB40'
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-4xl block mb-2">{trophy.emoji}</span>
                    <h3 className="font-semibold text-sm">{trophy.title}</h3>
                    <div 
                      className="mt-2 p-2 rounded-lg"
                      style={{ 
                        backgroundColor: isTeamJorge ? '#DC262615' : '#2563EB15'
                      }}
                    >
                      {trophy.winner_user ? (
                        <>
                          <p className="font-medium text-sm">
                            {trophy.winner_user.nickname || trophy.winner_user.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trophy.winner_team?.name || 
                              (trophy.winner_user.team_id === TEAM_JORGE_ID ? 'Pimentonas' : 'Tabaqueras')}
                          </p>
                        </>
                      ) : trophy.winner_team ? (
                        <p className="font-medium text-sm">{trophy.winner_team.name}</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Pending Trophies */}
      {pendingTrophies.length > 0 && (
        <>
          <h2 className="text-lg font-semibold flex items-center gap-2 mt-6">
            <Crown className="w-5 h-5 text-muted-foreground" />
            Por Entregar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {pendingTrophies.map((trophy) => (
              <Card 
                key={trophy.id}
                className="bg-muted/20 border-dashed"
              >
                <CardContent className="p-4 text-center">
                  <span className="text-4xl block mb-2 opacity-50">{trophy.emoji}</span>
                  <h3 className="font-semibold text-sm">{trophy.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {trophy.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Pendiente
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            Los trofeos serán asignados por el comisionado al finalizar el torneo
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
