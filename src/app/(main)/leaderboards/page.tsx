'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useTournament } from '@/hooks/use-tournament';
import { useTeamScores } from '@/hooks/use-team-scores';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, Beer, Target, Crown, Flag, Zap } from 'lucide-react';
import { TEAM_JORGE_ID, SSS_TOURNAMENT_ID, DRINK_EMOJIS } from '@/lib/constants';
import type { Profile } from '@/types/database';

interface DrinkStats {
  user_id: string;
  total: number;
  breakdown: Record<string, number>;
}

interface ChallengeStats {
  user_id: string;
  completed: number;
  points: number;
}

interface DrinkRow {
  user_id: string;
  drink_type: string;
  count: number;
}

interface ChallengeRow {
  assigned_to_user_id: string | null;
  status: string;
  challenge: { points_fun: number } | null;
}

export default function LeaderboardsPage() {
  const { teams, profiles, isLoading: tournamentLoading } = useTournament();
  const { pimentonas, tabaqueras, isLoading: scoresLoading } = useTeamScores();
  const [drinkStats, setDrinkStats] = useState<DrinkStats[]>([]);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  const fetchStats = useCallback(async () => {
    // Fetch drink stats
    const { data: drinks } = await supabase
      .from('drinks')
      .select('user_id, drink_type, count')
      .eq('tournament_id', SSS_TOURNAMENT_ID);

    if (drinks) {
      const statsMap = new Map<string, DrinkStats>();
      (drinks as DrinkRow[]).forEach(d => {
        if (!statsMap.has(d.user_id)) {
          statsMap.set(d.user_id, { user_id: d.user_id, total: 0, breakdown: {} });
        }
        const stat = statsMap.get(d.user_id)!;
        stat.total += d.count;
        stat.breakdown[d.drink_type] = (stat.breakdown[d.drink_type] || 0) + d.count;
      });
      setDrinkStats(Array.from(statsMap.values()).sort((a, b) => b.total - a.total));
    }

    // Fetch challenge stats
    const { data: challenges } = await supabase
      .from('challenge_assignments')
      .select(`
        assigned_to_user_id,
        status,
        challenge:challenges(points_fun)
      `)
      .eq('status', 'completed');

    if (challenges) {
      const statsMap = new Map<string, ChallengeStats>();
      (challenges as unknown as ChallengeRow[]).forEach(c => {
        if (!c.assigned_to_user_id) return;
        if (!statsMap.has(c.assigned_to_user_id)) {
          statsMap.set(c.assigned_to_user_id, { user_id: c.assigned_to_user_id, completed: 0, points: 0 });
        }
        const stat = statsMap.get(c.assigned_to_user_id)!;
        stat.completed += 1;
        stat.points += (c.challenge?.points_fun || 0);
      });
      setChallengeStats(Array.from(statsMap.values()).sort((a, b) => b.points - a.points));
    }

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getProfile = (userId: string): Profile | undefined => {
    return profiles.find(p => p.id === userId);
  };

  if (isLoading || tournamentLoading || scoresLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  const teamJorge = teams.find(t => t.id === TEAM_JORGE_ID);
  const teamYago = teams.find(t => t.id !== TEAM_JORGE_ID);
  const leading = pimentonas.total > tabaqueras.total ? 'pimentonas' : tabaqueras.total > pimentonas.total ? 'tabaqueras' : 'tie';

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-2xl font-bold">Rankings</h1>

      <Tabs defaultValue="teams">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">
            <Trophy className="w-4 h-4 mr-1" />
            Equipos
          </TabsTrigger>
          <TabsTrigger value="drinks">
            <Beer className="w-4 h-4 mr-1" />
            Copas
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="w-4 h-4 mr-1" />
            Retos
          </TabsTrigger>
        </TabsList>

        {/* Teams Leaderboard - CON DESGLOSE */}
        <TabsContent value="teams" className="mt-4 space-y-4">
          {/* Main Score Card */}
          <Card className="shadow-elevation-lg border-2">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                {/* Team Pimentonas */}
                <div className="text-center flex-1">
                  {teamJorge?.logo_url ? (
                    <div 
                      className={`w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-white shadow-elevation-md flex items-center justify-center mb-3 border-3 ${
                        leading === 'pimentonas' ? 'ring-4 ring-yellow-500' : ''
                      }`}
                      style={{ borderColor: '#DC2626' }}
                    >
                      <img src={teamJorge.logo_url} alt="Pimentonas" className="w-full h-full object-contain p-2" />
                    </div>
                  ) : (
                    <div 
                      className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                        leading === 'pimentonas' ? 'ring-4 ring-yellow-500' : ''
                      }`}
                      style={{ backgroundColor: '#DC262620', border: '3px solid #DC2626' }}
                    >
                      <span className="text-3xl font-bold" style={{ color: '#DC2626' }}>P</span>
                    </div>
                  )}
                  <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Pimentonas</p>
                  <div 
                    className="text-5xl font-black mt-1"
                    style={{ color: '#DC2626', fontFamily: 'var(--font-display)' }}
                  >
                    {pimentonas.total.toFixed(1)}
                  </div>
                  {leading === 'pimentonas' && (
                    <Badge className="mt-2 bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Liderando
                    </Badge>
                  )}
                </div>

                {/* VS */}
                <div className="px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-lg mb-2 mx-auto">
                    <Trophy className="w-7 h-7 text-yellow-600" />
                  </div>
                  <p className="text-xl font-bold text-muted-foreground">VS</p>
                </div>

                {/* Team Tabaqueras */}
                <div className="text-center flex-1">
                  {teamYago?.logo_url ? (
                    <div 
                      className={`w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-white shadow-elevation-md flex items-center justify-center mb-3 border-3 ${
                        leading === 'tabaqueras' ? 'ring-4 ring-yellow-500' : ''
                      }`}
                      style={{ borderColor: '#2563EB' }}
                    >
                      <img src={teamYago.logo_url} alt="Tabaqueras" className="w-full h-full object-contain p-2" />
                    </div>
                  ) : (
                    <div 
                      className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                        leading === 'tabaqueras' ? 'ring-4 ring-yellow-500' : ''
                      }`}
                      style={{ backgroundColor: '#2563EB20', border: '3px solid #2563EB' }}
                    >
                      <span className="text-3xl font-bold" style={{ color: '#2563EB' }}>T</span>
                    </div>
                  )}
                  <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Tabaqueras</p>
                  <div 
                    className="text-5xl font-black mt-1"
                    style={{ color: '#2563EB', fontFamily: 'var(--font-display)' }}
                  >
                    {tabaqueras.total.toFixed(1)}
                  </div>
                  {leading === 'tabaqueras' && (
                    <Badge className="mt-2 bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Liderando
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 mb-2">
                <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div className="h-full flex">
                    <div 
                      className="transition-all duration-500"
                      style={{ 
                        width: `${(pimentonas.total / (pimentonas.total + tabaqueras.total || 1)) * 100}%`,
                        backgroundColor: '#DC2626'
                      }}
                    />
                    <div 
                      className="transition-all duration-500"
                      style={{ 
                        width: `${(tabaqueras.total / (pimentonas.total + tabaqueras.total || 1)) * 100}%`,
                        backgroundColor: '#2563EB'
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points Breakdown */}
          <Card className="bg-gradient-to-br from-slate-50 to-white shadow-elevation-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Zap className="w-5 h-5 text-primary" />
                Desglose de Puntuación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Golf */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Golf</p>
                    <p className="text-xs text-muted-foreground">1 pto/match ganado • 0.5 pto/empate</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-lg font-bold">
                  <span style={{ color: '#DC2626' }}>{pimentonas.golf.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">-</span>
                  <span style={{ color: '#2563EB' }}>{tabaqueras.golf.toFixed(1)}</span>
                </div>
              </div>

              {/* Drinks */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Beer className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Copas</p>
                    <p className="text-xs text-muted-foreground">Puntos por copas consumidas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-lg font-bold">
                  <span style={{ color: '#DC2626' }}>{pimentonas.drinks.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">-</span>
                  <span style={{ color: '#2563EB' }}>{tabaqueras.drinks.toFixed(1)}</span>
                </div>
              </div>

              {/* Challenges */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Retos</p>
                    <p className="text-xs text-muted-foreground">{pimentonas.challengesCompleted} vs {tabaqueras.challengesCompleted} completados</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-lg font-bold">
                  <span style={{ color: '#DC2626' }}>{pimentonas.challenges.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">-</span>
                  <span style={{ color: '#2563EB' }}>{tabaqueras.challenges.toFixed(1)}</span>
                </div>
              </div>

              {/* Hidalgo (penalización si no validado) */}
              {(pimentonas.hidalgoPenalty > 0 || tabaqueras.hidalgoPenalty > 0) && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg">
                      {DRINK_EMOJIS.hidalgo ?? '🫗'}
                    </div>
                    <div>
                      <p className="font-semibold">Hidalgo (sin validar)</p>
                      <p className="text-xs text-muted-foreground">−1 pto por hidalgo no validado a tiempo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-lg font-bold">
                    <span style={{ color: '#DC2626' }}>−{pimentonas.hidalgoPenalty}</span>
                    <span className="text-muted-foreground text-sm">-</span>
                    <span style={{ color: '#2563EB' }}>−{tabaqueras.hidalgoPenalty}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm text-center">
                <span className="font-semibold">Todo suma.</span> Las copas y retos completados 
                añaden puntos al marcador de tu equipo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drinks Leaderboard - CON MEDALLAS */}
        <TabsContent value="drinks" className="mt-4 space-y-3">
          <Card className="bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/30 shadow-elevation-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Beer className="w-5 h-5 text-amber-600" />
                Ranking de Copas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {drinkStats.length === 0 ? (
                <div className="text-center py-8">
                  <Beer className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <p className="text-muted-foreground font-medium">
                    Nadie ha registrado copas aún
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    El marcador espera
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drinkStats.map((stat, index) => {
                    const profile = getProfile(stat.user_id);
                    const isTeamJorge = profile?.team_id === TEAM_JORGE_ID;
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                    const isTopThree = index < 3;
                    
                    return (
                      <div 
                        key={stat.user_id}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                          isTopThree 
                            ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 shadow-sm' 
                            : 'bg-muted/30'
                        }`}
                      >
                        {/* Position/Medal */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/40' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950 shadow-md' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 shadow-md' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {medal || index + 1}
                        </div>
                        
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
                          style={{ 
                            backgroundColor: isTeamJorge ? '#EF444420' : '#3B82F620',
                            border: `2px solid ${isTeamJorge ? '#EF4444' : '#3B82F6'}`,
                            color: isTeamJorge ? '#EF4444' : '#3B82F6'
                          }}
                        >
                          {profile?.nickname?.charAt(0) || profile?.display_name?.charAt(0) || '?'}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{profile?.nickname || profile?.display_name}</p>
                          <div className="flex gap-1.5 text-sm mt-1">
                            {Object.entries(stat.breakdown).map(([type, count]) => (
                              <span key={type} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                                {DRINK_EMOJIS[type] || '🥤'} {count}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="text-right">
                          <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                            {stat.total}
                          </p>
                          <p className="text-xs text-muted-foreground">copas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Leaderboard - CON MEDALLAS */}
        <TabsContent value="challenges" className="mt-4 space-y-3">
          <Card className="bg-gradient-to-br from-purple-500/10 via-background to-purple-500/5 border-purple-500/30 shadow-elevation-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Target className="w-5 h-5 text-purple-600" />
                Ranking de Retos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {challengeStats.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <p className="text-muted-foreground font-medium">
                    Nadie ha completado retos aún
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los retos esperan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {challengeStats.map((stat, index) => {
                    const profile = getProfile(stat.user_id);
                    const isTeamJorge = profile?.team_id === TEAM_JORGE_ID;
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                    const isTopThree = index < 3;
                    
                    return (
                      <div 
                        key={stat.user_id}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                          isTopThree 
                            ? 'bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 shadow-sm' 
                            : 'bg-muted/30'
                        }`}
                      >
                        {/* Position/Medal */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/40' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950 shadow-md' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 shadow-md' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {medal || index + 1}
                        </div>
                        
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
                          style={{ 
                            backgroundColor: isTeamJorge ? '#EF444420' : '#3B82F620',
                            border: `2px solid ${isTeamJorge ? '#EF4444' : '#3B82F6'}`,
                            color: isTeamJorge ? '#EF4444' : '#3B82F6'
                          }}
                        >
                          {profile?.nickname?.charAt(0) || profile?.display_name?.charAt(0) || '?'}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{profile?.nickname || profile?.display_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stat.completed} retos completados
                          </p>
                        </div>
                        
                        {/* Score */}
                        <div className="text-right">
                          <p className="text-3xl font-black text-green-600" style={{ fontFamily: 'var(--font-display)' }}>
                            {stat.points}
                          </p>
                          <p className="text-xs text-muted-foreground">puntos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
