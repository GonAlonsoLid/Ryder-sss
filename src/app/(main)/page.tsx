'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament, useMatches } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, Users, Target, Beer, ChevronRight, 
  Loader2, Flag, Zap 
} from 'lucide-react';
import Link from 'next/link';
import { TEAM_JORGE_ID, ROUND_FORMAT_LABELS, DRINK_EMOJIS } from '@/lib/constants';
import { EventsFeed } from '@/components/features/events-feed';

export default function DashboardPage() {
  const router = useRouter();
  const { player: profile, isLoading: authLoading, refreshProfile } = useSimpleAuth();
  const { tournament, teams, rounds, isLoading: tournamentLoading } = useTournament();
  const { matches } = useMatches();

  const isLoading = authLoading || tournamentLoading;

  // Si venimos del onboarding, refrescar el perfil para asegurar datos actualizados
  React.useEffect(() => {
    const onboardingComplete = document.cookie.includes('onboarding_complete=true');
    if (onboardingComplete) {
      refreshProfile();
      // Limpiar la cookie
      document.cookie = 'onboarding_complete=; path=/; max-age=0';
    }
  }, [refreshProfile]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/login');
    }
  }, [authLoading, profile, router]);

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

  // Calcular matches del usuario
  const myMatches = matches.filter(m => 
    m.team_a_players?.includes(profile?.id || '') || 
    m.team_b_players?.includes(profile?.id || '')
  );

  // Matches en progreso
  const liveMatches = matches.filter(m => m.status === 'in_progress');

  return (
    <PageContainer className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ 
                backgroundColor: isTeamJorge ? '#DC262620' : '#2563EB20',
                border: `2px solid ${isTeamJorge ? '#DC2626' : '#2563EB'}`
              }}
            >
              {profile?.avatar_url || '🏌️'}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Bienvenido,</p>
              <h1 className="text-2xl font-bold">{profile?.nickname || profile?.display_name}</h1>
              <div className="flex items-center gap-2 mt-1">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Banner */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              {(() => {
                const teamJorge = teams.find(t => t.id === TEAM_JORGE_ID);
                return teamJorge?.logo_url ? (
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center border-2" style={{ borderColor: '#DC2626' }}>
                    <img src={teamJorge.logo_url} alt="Pimentonas" className="w-full h-full object-contain p-1.5" />
                  </div>
                ) : null;
              })()}
              <div 
                className="text-3xl font-bold"
                style={{ color: '#DC2626' }}
              >
                {teams.find(t => t.id === TEAM_JORGE_ID)?.total_points || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pimentonas</p>
            </div>
            <div className="px-4">
              <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-center flex-1">
              {(() => {
                const teamYago = teams.find(t => t.id !== TEAM_JORGE_ID);
                return teamYago?.logo_url ? (
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center border-2" style={{ borderColor: '#2563EB' }}>
                    <img src={teamYago.logo_url} alt="Tabaqueras" className="w-full h-full object-contain p-1.5" />
                  </div>
                ) : null;
              })()}
              <div 
                className="text-3xl font-bold"
                style={{ color: '#2563EB' }}
              >
                {teams.find(t => t.id !== TEAM_JORGE_ID)?.total_points || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tabaqueras</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              En Juego Ahora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveMatches.slice(0, 3).map((match) => {
              const round = rounds.find(r => r.id === match.round_id);
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{round?.name}</p>
                        <p className="font-mono font-bold text-lg">{match.score_display}</p>
                      </div>
                      <Badge variant="secondary" className="animate-pulse">
                        LIVE
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tournament">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Trophy className="w-8 h-8 text-primary mb-2" />
              <p className="font-medium text-sm">Ver Torneo</p>
              <p className="text-xs text-muted-foreground">{rounds.length} rondas</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/drinks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Beer className="w-8 h-8 text-amber-500 mb-2" />
              <p className="font-medium text-sm">Registrar Copa</p>
              <p className="text-xs text-muted-foreground">¡A hidratarse!</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/challenges">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Target className="w-8 h-8 text-green-500 mb-2" />
              <p className="font-medium text-sm">Mis Retos</p>
              <p className="text-xs text-muted-foreground">Desafíos activos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/hidalgo">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <span className="text-2xl mb-2">{DRINK_EMOJIS.hidalgo ?? '🫗'}</span>
              <p className="font-medium text-sm">Validar Hidalgo</p>
              <p className="text-xs text-muted-foreground">Validar hidalgos del otro equipo</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trophies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Flag className="w-8 h-8 text-purple-500 mb-2" />
              <p className="font-medium text-sm">Trofeos</p>
              <p className="text-xs text-muted-foreground">Vitrina SSS</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* My Matches */}
      {myMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mis Partidos</CardTitle>
              <Link href="/tournament">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {myMatches.map((match) => {
              const round = rounds.find(r => r.id === match.round_id);
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{round?.name}</p>
                        <p className="font-medium">{ROUND_FORMAT_LABELS[round?.format || 'singles']}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          match.status === 'completed' ? 'default' :
                          match.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {match.status === 'completed' ? match.score_display :
                           match.status === 'in_progress' ? 'LIVE' : 'Próximo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Rounds Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Programa del Finde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rounds.map((round) => (
            <Link key={round.id} href={`/rounds/${round.id}`}>
              <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{round.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROUND_FORMAT_LABELS[round.format]}
                    </p>
                  </div>
                  <Badge variant={round.is_completed ? 'default' : 'outline'}>
                    {round.is_completed ? 'Finalizada' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Events Feed */}
      <EventsFeed />
    </PageContainer>
  );
}

