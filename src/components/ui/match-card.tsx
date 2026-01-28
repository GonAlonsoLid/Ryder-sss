'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Clock, Play, CheckCircle } from 'lucide-react';

interface PlayerInfo {
  name: string;
  nickname?: string | null;
  handicap?: number | null;
}

interface MatchCardProps {
  id: string;
  roundName: string;
  format: string;
  scoreDisplay?: string;
  status: 'pending' | 'in_progress' | 'completed';
  teamAPlayers: PlayerInfo[];
  teamBPlayers: PlayerInfo[];
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  href: string;
  compact?: boolean;
}

export function MatchCard({
  id,
  roundName,
  format,
  scoreDisplay,
  status,
  teamAPlayers,
  teamBPlayers,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
  href,
  compact = false,
}: MatchCardProps) {
  const statusConfig = {
    pending: { icon: Clock, label: 'Pendiente', color: 'bg-muted text-muted-foreground' },
    in_progress: { icon: Play, label: 'En juego', color: 'bg-primary text-primary-foreground animate-pulse' },
    completed: { icon: CheckCircle, label: 'Finalizado', color: 'bg-green-500 text-white' },
  };

  const StatusIcon = statusConfig[status].icon;

  // Calcular handicaps totales de cada lado
  const teamAHandicap = teamAPlayers.reduce((sum, p) => sum + (p.handicap || 0), 0);
  const teamBHandicap = teamBPlayers.reduce((sum, p) => sum + (p.handicap || 0), 0);
  
  // Calcular golpes de ventaja (strokes)
  const handicapDiff = Math.abs(teamAHandicap - teamBHandicap);
  const strokesInfo = handicapDiff > 0 
    ? teamAHandicap > teamBHandicap 
      ? { receiver: 'A', giver: 'B', strokes: Math.round(handicapDiff) }
      : { receiver: 'B', giver: 'A', strokes: Math.round(handicapDiff) }
    : null;

  return (
    <Link href={href}>
      <Card className={cn(
        'hover:shadow-elevation-md transition-all cursor-pointer',
        status === 'in_progress' && 'border-primary/50 ring-1 ring-primary/20',
        compact && 'p-3'
      )}>
        <CardContent className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{roundName}</p>
              <p className="font-medium text-sm">{format}</p>
            </div>
            <Badge className={statusConfig[status].color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[status].label}
            </Badge>
          </div>

          {scoreDisplay && (
            <div className="mb-3">
              <p className="text-2xl font-bold font-mono text-center" style={{ fontFamily: 'var(--font-display)' }}>
                {scoreDisplay}
              </p>
            </div>
          )}

          {/* Strokes badge */}
          {strokesInfo && strokesInfo.strokes > 0 && (
            <div className="mb-3 text-center">
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                {strokesInfo.receiver === 'A' 
                  ? `${teamAPlayers.map(p => p.name).join(' & ')} recibe ${strokesInfo.strokes} golpes`
                  : `${teamBPlayers.map(p => p.name).join(' & ')} recibe ${strokesInfo.strokes} golpes`
                }
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0 self-start mt-1"
                  style={{ backgroundColor: teamAColor }}
                />
                <div className="min-w-0">
                  {teamAPlayers.map((p, i) => (
                    <div key={i} className={i > 0 ? 'mt-1' : ''}>
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      {p.nickname && (
                        <p className="text-xs text-muted-foreground truncate">"{p.nickname}"</p>
                      )}
                    </div>
                  ))}
                  {!compact && teamAPlayers.some(p => p.handicap) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      HCP: {teamAPlayers.map(p => p.handicap || '-').join(' / ')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{teamAName}</p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mx-2 flex-shrink-0">vs</p>
            <div className="flex-1">
              <div className="flex items-center justify-end gap-2">
                <div className="text-right min-w-0">
                  {teamBPlayers.map((p, i) => (
                    <div key={i} className={i > 0 ? 'mt-1' : ''}>
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      {p.nickname && (
                        <p className="text-xs text-muted-foreground truncate">"{p.nickname}"</p>
                      )}
                    </div>
                  ))}
                  {!compact && teamBPlayers.some(p => p.handicap) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      HCP: {teamBPlayers.map(p => p.handicap || '-').join(' / ')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{teamBName}</p>
                </div>
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0 self-start mt-1"
                  style={{ backgroundColor: teamBColor }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
