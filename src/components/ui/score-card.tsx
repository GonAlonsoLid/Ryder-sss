'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Flag, Beer, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TeamScore {
  id: string;
  name: string;
  points: number;
  logoUrl?: string | null;
  color: string;
  // Breakdown (opcional)
  golf?: number;
  drinks?: number;
  challenges?: number;
}

interface ScoreCardProps {
  teamA: TeamScore;
  teamB: TeamScore;
  status?: 'live' | 'completed' | 'pending';
  matchUrl?: string;
  showBreakdown?: boolean;
  className?: string;
}

export function ScoreCard({ teamA, teamB, status = 'pending', matchUrl, showBreakdown = false, className }: ScoreCardProps) {
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const leadingTeam = teamA.points > teamB.points ? teamA : teamB.points > teamA.points ? teamB : null;
  const hasBreakdown = showBreakdown && teamA.golf !== undefined;

  return (
    <Card className={cn(
      'shadow-elevation-lg border-2 transition-all hover:shadow-elevation-xl',
      isLive && 'border-primary/50 ring-2 ring-primary/20',
      className
    )}>
      <CardContent className="p-6">
        {/* Status Badge */}
        {isLive && (
          <div className="flex justify-center mb-4">
            <Badge className="bg-primary text-primary-foreground animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              EN JUEGO
            </Badge>
          </div>
        )}

        {/* Score Display */}
        <div className="flex items-center justify-between mb-4">
          {/* Team A */}
          <div className="flex-1 text-center">
            {teamA.logoUrl ? (
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden bg-white shadow-elevation-md flex items-center justify-center border-2"
                style={{ borderColor: teamA.color }}
              >
                <img src={teamA.logoUrl} alt={teamA.name} className="w-full h-full object-contain p-3" />
              </div>
            ) : (
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-elevation-md border-2"
                style={{ 
                  backgroundColor: `${teamA.color}20`,
                  borderColor: teamA.color
                }}
              >
                <span className="text-2xl font-bold" style={{ color: teamA.color }}>
                  {teamA.name.charAt(0)}
                </span>
              </div>
            )}
            <p className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {teamA.name}
            </p>
            <div 
              className={cn(
                'text-5xl font-black transition-all',
                leadingTeam?.id === teamA.id && 'scale-110'
              )}
              style={{ 
                color: teamA.color,
                fontFamily: 'var(--font-display)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {teamA.points.toFixed(1)}
            </div>
          </div>

          {/* VS */}
          <div className="px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center shadow-elevation-md mb-2">
              <Trophy className="w-7 h-7 text-yellow-600" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">VS</p>
          </div>

          {/* Team B */}
          <div className="flex-1 text-center">
            {teamB.logoUrl ? (
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden bg-white shadow-elevation-md flex items-center justify-center border-2"
                style={{ borderColor: teamB.color }}
              >
                <img src={teamB.logoUrl} alt={teamB.name} className="w-full h-full object-contain p-3" />
              </div>
            ) : (
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-elevation-md border-2"
                style={{ 
                  backgroundColor: `${teamB.color}20`,
                  borderColor: teamB.color
                }}
              >
                <span className="text-2xl font-bold" style={{ color: teamB.color }}>
                  {teamB.name.charAt(0)}
                </span>
              </div>
            )}
            <p className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {teamB.name}
            </p>
            <div 
              className={cn(
                'text-5xl font-black transition-all',
                leadingTeam?.id === teamB.id && 'scale-110'
              )}
              style={{ 
                color: teamB.color,
                fontFamily: 'var(--font-display)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {teamB.points.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <div className="h-full flex">
              <div 
                className="transition-all duration-500"
                style={{ 
                  width: `${(teamA.points / (teamA.points + teamB.points || 1)) * 100}%`,
                  backgroundColor: teamA.color
                }}
              />
              <div 
                className="transition-all duration-500"
                style={{ 
                  width: `${(teamB.points / (teamA.points + teamB.points || 1)) * 100}%`,
                  backgroundColor: teamB.color
                }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        {hasBreakdown && (
          <div className="bg-muted/30 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide mb-3">
              Desglose de puntos
            </p>
            
            {/* Golf */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Golf</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold" style={{ color: teamA.color }}>{(teamA.golf ?? 0).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">-</span>
                <span className="text-sm font-bold" style={{ color: teamB.color }}>{(teamB.golf ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Drinks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Beer className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium">Copas</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold" style={{ color: teamA.color }}>{(teamA.drinks ?? 0).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">-</span>
                <span className="text-sm font-bold" style={{ color: teamB.color }}>{(teamB.drinks ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Challenges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Retos</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold" style={{ color: teamA.color }}>{(teamA.challenges ?? 0).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">-</span>
                <span className="text-sm font-bold" style={{ color: teamB.color }}>{(teamB.challenges ?? 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {matchUrl && (
          <Link href={matchUrl} className="block">
            <Button className="w-full h-12 text-base font-semibold shadow-elevation-md">
              {isLive ? 'Actualizar Score' : isCompleted ? 'Ver Detalles' : 'Ver Torneo'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

