'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Clock, Play, CheckCircle } from 'lucide-react';

interface MatchCardProps {
  id: string;
  roundName: string;
  format: string;
  scoreDisplay?: string;
  status: 'pending' | 'in_progress' | 'completed';
  teamAPlayers: string[];
  teamBPlayers: string[];
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

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: teamAColor }}
                />
                <p className="text-sm font-medium">{teamAPlayers.join(' & ')}</p>
              </div>
              <p className="text-xs text-muted-foreground ml-5">{teamAName}</p>
            </div>
            <p className="text-muted-foreground mx-2">vs</p>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="text-sm font-medium">{teamBPlayers.join(' & ')}</p>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: teamBColor }}
                />
              </div>
              <p className="text-xs text-muted-foreground mr-5">{teamBName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

