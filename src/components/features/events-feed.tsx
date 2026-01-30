'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useEventsFeed } from '@/hooks/use-realtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Beer, Target, Trophy, Flag } from 'lucide-react';
import { SSS_TOURNAMENT_ID, TEAM_JORGE_ID, DRINK_EMOJIS, timeAgo } from '@/lib/constants';
import type { EventFeed, Profile } from '@/types/database';

interface EventWithActor extends EventFeed {
  actor?: Profile;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  score_update: <Flag className="w-4 h-4" />,
  drink: <Beer className="w-4 h-4" />,
  challenge_completed: <Target className="w-4 h-4 text-green-500" />,
  challenge_failed: <Target className="w-4 h-4 text-red-500" />,
  trophy_awarded: <Trophy className="w-4 h-4 text-yellow-500" />,
  match_started: <Activity className="w-4 h-4 text-blue-500" />,
  match_completed: <Flag className="w-4 h-4 text-green-500" />,
};

function getEventMessage(event: EventWithActor): string {
  const actorName = event.actor?.nickname || event.actor?.display_name || 'Alguien';
  const payload = event.payload || {};

  switch (event.event_type) {
    case 'drink':
      const drinkType = payload.drink_type as string;
      const emoji = DRINK_EMOJIS[drinkType] || '🥤';
      return `${actorName} se ha metido un ${drinkType} ${emoji}`;
    case 'score_update':
      return `${actorName} ha actualizado el marcador: ${payload.score || ''}`;
    case 'challenge_completed':
      return `${actorName} ha completado: ${payload.title || 'un reto'}`;
    case 'challenge_failed':
      return `${actorName} ha fallado: ${payload.title || 'un reto'}`;
    case 'trophy_awarded':
      return `🏆 ${actorName} ha ganado: ${payload.title || 'un trofeo'}`;
    case 'match_started':
      return `Comienza partido: ${payload.description || ''}`;
    case 'match_completed':
      return `Finalizado: ${payload.description || ''}`;
    default:
      return `${actorName} ha hecho algo`;
  }
}

export function EventsFeed() {
  const [events, setEvents] = useState<EventWithActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events_feed')
      .select(`
        *,
        actor:profiles!events_feed_actor_user_id_fkey(*)
      `)
      .eq('tournament_id', SSS_TOURNAMENT_ID)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setEvents(data as EventWithActor[]);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime updates
  useEventsFeed(SSS_TOURNAMENT_ID, (newEvent) => {
    // Fetch the new event with actor info
    fetchEvents();
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Group events by time
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    let group = 'HOY';
    if (diffMinutes < 5) group = 'AHORA MISMO';
    else if (diffMinutes < 60) group = 'HACE UN RATO';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(event);
    return acc;
  }, {} as Record<string, EventWithActor[]>);

  const getActorTeamColor = (event: EventWithActor): string | null => {
    const teamId = event.actor?.team_id;
    if (!teamId) return null;
    return teamId === TEAM_JORGE_ID ? '#DC2626' : '#2563EB'; // Pimentonas rojo, Tabaqueras azul
  };

  return (
    <Card className="shadow-elevation-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Activity className="w-5 h-5 text-primary" />
          Feed en Vivo
          <Badge variant="outline" className="ml-auto text-xs">
            {events.length} eventos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-5xl mb-4 block">📢</span>
            <p className="text-muted-foreground font-medium">
              Aún no hay actividad
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ¡A jugar y a registrar copas!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([group, groupEvents]) => (
                <div key={group}>
                  {/* Time Group Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      {group}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  {/* Events in Group */}
                  <div className="space-y-2 ml-1">
                    {groupEvents.map((event) => {
                      const teamColor = getActorTeamColor(event);
                      return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border-l-4 transition-all hover:bg-muted/50 animate-slide-up"
                        style={{ borderLeftColor: teamColor ?? 'var(--muted)' }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          {EVENT_ICONS[event.event_type] || <Activity className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{getEventMessage(event)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo(event.created_at)}
                          </p>
                        </div>
                      </div>
                    ); })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

