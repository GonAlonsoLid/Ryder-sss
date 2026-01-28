'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useTournament } from '@/hooks/use-tournament';
import { useMatchUpdates } from '@/hooks/use-realtime';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { TEAM_JORGE_ID, ROUND_FORMAT_LABELS, ROUND_FORMAT_DESCRIPTIONS } from '@/lib/constants';
import type { Match, Round } from '@/types/database';

export default function RoundPage({ params }: { params: Promise<{ roundId: string }> }) {
  const { roundId } = use(params);
  const [round, setRound] = useState<Round | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { teams, profiles } = useTournament();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchData = async () => {
      const [roundRes, matchesRes] = await Promise.all([
        supabase.from('rounds').select('*').eq('id', roundId).single(),
        supabase.from('matches').select('*').eq('round_id', roundId).order('created_at'),
      ]);

      if (roundRes.data) setRound(roundRes.data as Round);
      if (matchesRes.data) setMatches(matchesRes.data as Match[]);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, roundId]);

  // Real-time match updates
  useMatchUpdates((updatedMatch) => {
    const updated = updatedMatch as unknown as Match;
    if (updated && updated.id) {
      setMatches(prev => 
        prev.map(m => m.id === updated.id ? updated : m)
      );
    }
  });

  const getPlayerInfo = (playerIds: string[]): { name: string; nickname: string | null }[] => {
    if (!playerIds || playerIds.length === 0) return [{ name: 'Sin asignar', nickname: null }];
    return playerIds.map(id => {
      const player = profiles.find(p => p.id === id);
      return {
        name: player?.display_name || 'Desconocido',
        nickname: player?.nickname || null,
      };
    });
  };

  const getPlayersHandicap = (playerIds: string[]): number => {
    if (!playerIds || playerIds.length === 0) return 0;
    return playerIds.reduce((sum, id) => {
      const player = profiles.find(p => p.id === id);
      return sum + (player?.handicap || 0);
    }, 0);
  };

  const getStrokesInfo = (teamAIds: string[], teamBIds: string[]) => {
    const hcpA = getPlayersHandicap(teamAIds);
    const hcpB = getPlayersHandicap(teamBIds);
    const diff = Math.abs(hcpA - hcpB);
    if (diff === 0) return null;
    return {
      receiver: hcpA > hcpB ? 'A' : 'B',
      strokes: Math.round(diff)
    };
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  if (!round) {
    return (
      <PageContainer>
        <p className="text-center text-muted-foreground">Ronda no encontrada</p>
      </PageContainer>
    );
  }

  const teamJorgePoints = matches.reduce((acc, m) => {
    if (m.team_a_id === TEAM_JORGE_ID) return acc + m.team_a_points;
    if (m.team_b_id === TEAM_JORGE_ID) return acc + m.team_b_points;
    return acc;
  }, 0);

  const teamYagoPoints = matches.reduce((acc, m) => {
    if (m.team_a_id !== TEAM_JORGE_ID && m.team_a_id) return acc + m.team_a_points;
    if (m.team_b_id !== TEAM_JORGE_ID && m.team_b_id) return acc + m.team_b_points;
    return acc;
  }, 0);

  return (
    <PageContainer className="space-y-4">
      {/* Back Button */}
      <Link href="/tournament">
        <Button variant="ghost" size="sm" className="mb-2 -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
      </Link>

      {/* Round Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                {ROUND_FORMAT_LABELS[round.format]}
              </Badge>
              <h1 className="text-xl font-bold">{round.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {ROUND_FORMAT_DESCRIPTIONS[round.format]}
              </p>
            </div>
            {round.is_completed && (
              <Trophy className="w-8 h-8 text-primary" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Round Score */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>
                {teamJorgePoints}
              </p>
              <p className="text-xs text-muted-foreground">Pimentonas</p>
            </div>
            <div className="px-4">
              <p className="text-sm font-medium text-muted-foreground">
                {matches.filter(m => m.status === 'completed').length}/{matches.length}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>
                {teamYagoPoints}
              </p>
              <p className="text-xs text-muted-foreground">Tabaqueras</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Partidos</h2>
        {matches.map((match, index) => {
          const teamA = teams.find(t => t.id === match.team_a_id);
          const teamB = teams.find(t => t.id === match.team_b_id);
          const isLive = match.status === 'in_progress';
          const isCompleted = match.status === 'completed';
          const strokesInfo = getStrokesInfo(match.team_a_players, match.team_b_players);
          const hcpA = getPlayersHandicap(match.team_a_players);
          const hcpB = getPlayersHandicap(match.team_b_players);
          const playersA = getPlayerInfo(match.team_a_players);
          const playersB = getPlayerInfo(match.team_b_players);

          return (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <Card className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                isLive ? 'border-primary/50 animate-pulse-glow' : ''
              }`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">Partido {index + 1}</p>
                    {isLive && (
                      <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
                    )}
                    {isCompleted && (
                      <Badge>Final</Badge>
                    )}
                    {!isLive && !isCompleted && (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>

                  {/* Strokes info */}
                  {strokesInfo && (
                    <div className="mb-3 text-center">
                      <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                        {strokesInfo.receiver === 'A' 
                          ? `${playersA.map(p => p.name).join(' & ')} recibe ${strokesInfo.strokes} golpes`
                          : `${playersB.map(p => p.name).join(' & ')} recibe ${strokesInfo.strokes} golpes`
                        }
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Team A */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 self-start mt-1"
                          style={{ backgroundColor: teamA?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}
                        />
                        <div className="min-w-0">
                          {playersA.map((player, i) => (
                            <div key={i} className={i > 0 ? 'mt-1' : ''}>
                              <p className="text-sm font-semibold truncate">{player.name}</p>
                              {player.nickname && (
                                <p className="text-xs text-muted-foreground truncate">"{player.nickname}"</p>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">HCP {hcpA}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="px-4 text-center flex-shrink-0">
                      <p className={`text-xl font-mono font-bold ${
                        isLive ? 'text-primary' : ''
                      }`}>
                        {match.score_display || 'AS'}
                      </p>
                      {match.holes_played > 0 && (
                        <p className="text-xs text-muted-foreground">
                          H{match.holes_played}
                        </p>
                      )}
                    </div>

                    {/* Team B */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="text-right min-w-0">
                          {playersB.map((player, i) => (
                            <div key={i} className={i > 0 ? 'mt-1' : ''}>
                              <p className="text-sm font-semibold truncate">{player.name}</p>
                              {player.nickname && (
                                <p className="text-xs text-muted-foreground truncate">"{player.nickname}"</p>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">HCP {hcpB}</p>
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 self-start mt-1"
                          style={{ backgroundColor: teamB?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
