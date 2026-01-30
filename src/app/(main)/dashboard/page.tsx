'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament, useMatches } from '@/hooks/use-tournament';
import { useTeamScores } from '@/hooks/use-team-scores';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Users, Target, Beer, 
  Loader2, Flag, Zap 
} from 'lucide-react';
import Link from 'next/link';
import { TEAM_JORGE_ID, ROUND_FORMAT_LABELS, DRINK_EMOJIS } from '@/lib/constants';
import { EventsFeed } from '@/components/features/events-feed';
import { ScoreCard } from '@/components/ui/score-card';
import { MatchCard } from '@/components/ui/match-card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { PlayerAvatar } from '@/components/ui/player-avatar';

export default function DashboardPage() {
  const router = useRouter();
  const { player, isLoading: authLoading, isAuthenticated } = useSimpleAuth();
  const { tournament, teams, rounds, profiles, isLoading: tournamentLoading } = useTournament();
  const { matches } = useMatches();
  const { pimentonas, tabaqueras, isLoading: scoresLoading } = useTeamScores();

  const isLoading = authLoading || tournamentLoading || scoresLoading;
  
  // Check authentication
  React.useEffect(() => {
    if (authLoading) return;
    
    // Not logged in - redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // No nickname - redirect to onboarding to set it
    if (player && !player.nickname) {
      router.push('/onboarding');
      return;
    }
  }, [authLoading, isAuthenticated, player, router]);

  // Use player as profile
  const profile = player;

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  const userTeam = teams.find(t => t.id === profile?.team_id);
  const opposingTeam = teams.find(t => t.id !== profile?.team_id);
  const isTeamJorge = profile?.team_id === TEAM_JORGE_ID;
  const teamColor = isTeamJorge ? '#DC2626' : '#2563EB';
  const opposingTeamColor = isTeamJorge ? '#2563EB' : '#DC2626';

  // Todos los miembros de mi equipo (incluyéndome)
  const myTeamMembers = profiles.filter(p => p.team_id === profile?.team_id);
  // Todos los miembros del equipo contrario
  const opposingTeamMembers = profiles.filter(p => p.team_id === opposingTeam?.id);

  // Matches en progreso
  const liveMatches = matches.filter(m => m.status === 'in_progress');

  return (
    <PageContainer className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 shadow-elevation-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <PlayerAvatar
              avatarUrl={profile?.avatar_url}
              name={profile?.display_name || ''}
              size="lg"
              teamColor={isTeamJorge ? '#DC2626' : '#2563EB'}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Bienvenido,</p>
              <h1 className="text-2xl font-bold truncate">{profile?.display_name}</h1>
              {profile?.nickname && (
                <p className="text-sm text-muted-foreground truncate">"{profile.nickname}"</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: isTeamJorge ? '#DC2626' : '#2563EB',
                    color: isTeamJorge ? '#DC2626' : '#2563EB'
                  }}
                >
                  <Users className="w-3 h-3 mr-1" />
                  {userTeam?.name}
                </Badge>
                {profile?.handicap && (
                  <Badge variant="secondary" className="text-xs">
                    HCP {profile.handicap}
                  </Badge>
                )}
              </div>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground mt-3 italic">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipos con Tabs */}
      <Card className="shadow-elevation-sm" style={{ borderColor: `${teamColor}30` }}>
        <CardHeader className="pb-0 pt-1 px-2">
          <div className="flex items-center">
            <CardTitle className="text-3xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              {userTeam?.logo_url ? (
                <img src={userTeam.logo_url} alt="" className="w-32 h-32 object-contain" />
              ) : (
                <Users className="w-16 h-16" style={{ color: teamColor }} />
              )}
              Equipos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-1">
          <Tabs defaultValue="my-team" className="w-full -mt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-team" className="text-sm">
                {userTeam?.name}
              </TabsTrigger>
              <TabsTrigger value="opposing-team" className="text-sm">
                Los Perdedores
              </TabsTrigger>
            </TabsList>
            
            {/* Mi Equipo */}
            <TabsContent value="my-team" className="mt-4 space-y-2">
              {myTeamMembers.map((member) => {
                const isMe = member.id === profile?.id;
                return (
                  <div 
                    key={member.id} 
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{ 
                      backgroundColor: `${teamColor}${isMe ? '15' : '08'}`,
                      boxShadow: isMe ? `0 0 0 2px ${teamColor}` : 'none'
                    }}
                  >
                    <PlayerAvatar
                      avatarUrl={member.avatar_url}
                      name={member.display_name}
                      size="lg"
                      teamColor={teamColor}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{member.display_name}</p>
                        {isMe && (
                          <Badge variant="default" className="text-xs shrink-0" style={{ backgroundColor: teamColor }}>
                            Tú
                          </Badge>
                        )}
                        {member.handicap && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            HCP {member.handicap}
                          </Badge>
                        )}
                      </div>
                      {member.nickname && (
                        <p className="text-xs text-muted-foreground">"{member.nickname}"</p>
                      )}
                      {member.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {myTeamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay miembros del equipo
                </p>
              )}
            </TabsContent>

            {/* Equipo Contrario - Los Perdedores */}
            <TabsContent value="opposing-team" className="mt-4 space-y-2">
              {opposingTeamMembers.map((member) => {
                return (
                  <div 
                    key={member.id} 
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{ 
                      backgroundColor: `${opposingTeamColor}08`,
                      border: `1px solid ${opposingTeamColor}30`
                    }}
                  >
                    <PlayerAvatar
                      avatarUrl={member.avatar_url}
                      name={member.display_name}
                      size="lg"
                      teamColor={opposingTeamColor}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{member.display_name}</p>
                        {member.handicap && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            HCP {member.handicap}
                          </Badge>
                        )}
                      </div>
                      {member.nickname && (
                        <p className="text-xs text-muted-foreground">"{member.nickname}"</p>
                      )}
                      {member.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {opposingTeamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay miembros del equipo contrario
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Scoreboard - Con desglose de puntuación */}
      <ScoreCard
        teamA={{
          id: pimentonas.teamId,
          name: pimentonas.teamName,
          points: pimentonas.total,
          logoUrl: teams.find(t => t.id === TEAM_JORGE_ID)?.logo_url || null,
          color: '#EF4444',
          golf: pimentonas.golf,
          drinks: pimentonas.drinks,
          challenges: pimentonas.challenges,
        }}
        teamB={{
          id: tabaqueras.teamId,
          name: tabaqueras.teamName,
          points: tabaqueras.total,
          logoUrl: teams.find(t => t.id !== TEAM_JORGE_ID)?.logo_url || null,
          color: '#3B82F6',
          golf: tabaqueras.golf,
          drinks: tabaqueras.drinks,
          challenges: tabaqueras.challenges,
        }}
        status={liveMatches.length > 0 ? 'live' : 'pending'}
        matchUrl="/tournament"
        showBreakdown={true}
      />

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card className="shadow-elevation-md border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              En Juego Ahora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveMatches.slice(0, 3).map((match) => {
              const round = rounds.find(r => r.id === match.round_id);
              const teamA = teams.find(t => t.id === match.team_a_id);
              const teamB = teams.find(t => t.id === match.team_b_id);
              const teamAPlayers = (match.team_a_players || []).map(id => {
                const p = profiles.find(pr => pr.id === id);
                return { 
                  name: p?.display_name || 'Sin asignar', 
                  nickname: p?.nickname || null,
                  handicap: p?.handicap 
                };
              });
              const teamBPlayers = (match.team_b_players || []).map(id => {
                const p = profiles.find(pr => pr.id === id);
                return { 
                  name: p?.display_name || 'Sin asignar', 
                  nickname: p?.nickname || null,
                  handicap: p?.handicap 
                };
              });

              return (
                <MatchCard
                  key={match.id}
                  id={match.id}
                  roundName={round?.name || ''}
                  format={ROUND_FORMAT_LABELS[round?.format || 'singles']}
                  scoreDisplay={match.score_display || undefined}
                  status={match.status}
                  teamAPlayers={teamAPlayers}
                  teamBPlayers={teamBPlayers}
                  teamAName={teamA?.name || ''}
                  teamBName={teamB?.name || ''}
                  teamAColor={teamA?.id === TEAM_JORGE_ID ? '#EF4444' : '#3B82F6'}
                  teamBColor={teamB?.id === TEAM_JORGE_ID ? '#EF4444' : '#3B82F6'}
                  href={`/matches/${match.id}`}
                  compact
                />
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Mensaje motivacional si tu equipo va perdiendo */}
      {isTeamJorge ? (
        pimentonas.total < tabaqueras.total && (
          <Card className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-red-700">
                Pimentonas: es hora de remontar. Cada copa y reto suma.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        tabaqueras.total < pimentonas.total && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-blue-700">
                Tabaqueras: es hora de remontar. Cada copa y reto suma.
              </p>
            </CardContent>
          </Card>
        )
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tournament">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 border-transparent hover:border-primary/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Flag className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-sm">Golf</p>
              <p className="text-xs text-muted-foreground">
                {pimentonas.matchesWon + tabaqueras.matchesWon} partidos jugados
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/drinks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 border-transparent hover:border-amber-500/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                <Beer className="w-6 h-6 text-amber-600" />
              </div>
              <p className="font-semibold text-sm">Registrar Copa</p>
              <p className="text-xs text-muted-foreground">
                {pimentonas.totalDrinks + tabaqueras.totalDrinks} copas totales
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/challenges">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 border-transparent hover:border-purple-500/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-sm">Retos</p>
              <p className="text-xs text-muted-foreground">
                {pimentonas.challengesCompleted + tabaqueras.challengesCompleted} completados
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/hidalgo">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 border-transparent hover:border-amber-500/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 text-xl">
                {DRINK_EMOJIS.hidalgo ?? '🫗'}
              </div>
              <p className="font-semibold text-sm">Validar Hidalgo</p>
              <p className="text-xs text-muted-foreground">Validar hidalgos anoche</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trophies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 border-transparent hover:border-yellow-500/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="font-semibold text-sm">Trofeos</p>
              <p className="text-xs text-muted-foreground">Vitrina SSS</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator />

      {/* Events Feed */}
      <EventsFeed />

      {/* Floating Action Button for Quick Actions */}
      <FloatingActionButton
        onClick={() => router.push('/drinks')}
        icon={<Beer className="w-6 h-6" />}
        label="Registrar Copa"
      />
    </PageContainer>
  );
}

