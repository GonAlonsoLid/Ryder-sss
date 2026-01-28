'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament } from '@/hooks/use-tournament';
import { useTeamScores } from '@/hooks/use-team-scores';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Beer, TrendingUp, Sparkles, Lock, Calendar } from 'lucide-react';
import { SSS_TOURNAMENT_ID, DRINK_EMOJIS, DRINK_LABELS, timeAgo, DRINK_POINTS, TEAM_JORGE_ID } from '@/lib/constants';
import type { Drink, Profile, DrinkType } from '@/types/database';

const DRINK_TYPES: DrinkType[] = ['cerveza', 'chupito', 'copa', 'hidalgo'];

// Bloqueo hasta viernes 30 Enero 2026 a las 19:00 (antes del Ryder)
const DRINKS_UNLOCK_DATE = new Date('2026-01-30T19:00:00');

interface DrinkWithProfile extends Drink {
  profile?: Profile;
}

interface DrinkRow {
  drink_type: string;
  count: number;
}

export default function DrinksPage() {
  const { player, isLoading: authLoading } = useSimpleAuth();
  const profile = player;
  const { profiles, isLoading: tournamentLoading } = useTournament();
  const { pimentonas, tabaqueras, isLoading: scoresLoading, refetch: refetchScores } = useTeamScores();
  const [myDrinks, setMyDrinks] = useState<Record<string, number>>({});
  const [recentDrinks, setRecentDrinks] = useState<DrinkWithProfile[]>([]);
  const [drinksLoading, setDrinksLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const isTeamJorge = profile?.team_id === TEAM_JORGE_ID;
  const myTeamScore = isTeamJorge ? pimentonas : tabaqueras;
  const myTeamName = isTeamJorge ? 'Pimentonas' : 'Tabaqueras';
  const myTeamColor = isTeamJorge ? '#DC2626' : '#2563EB';

  const isDrinksLocked = new Date() < DRINKS_UNLOCK_DATE;

  const fetchDrinks = useCallback(async () => {
    if (!player?.id) return;
    setDrinksLoading(true);

    try {
      // Fetch my drinks today
      const today = new Date().toISOString().split('T')[0];
      const { data: myDrinksData } = await supabase
        .from('drinks')
        .select('drink_type, count')
        .eq('user_id', player.id)
        .eq('tournament_id', SSS_TOURNAMENT_ID)
        .gte('created_at', today);

      if (myDrinksData) {
        const counts: Record<string, number> = {};
        (myDrinksData as DrinkRow[]).forEach(d => {
          counts[d.drink_type] = (counts[d.drink_type] || 0) + d.count;
        });
        setMyDrinks(counts);
      }

      // Fetch recent drinks from everyone
      const { data: recentData } = await supabase
        .from('drinks')
        .select('*')
        .eq('tournament_id', SSS_TOURNAMENT_ID)
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentData) {
        const drinksWithProfiles = (recentData as Drink[]).map(d => ({
          ...d,
          profile: profiles.find(p => p.id === d.user_id),
        }));
        setRecentDrinks(drinksWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching drinks:', error);
    } finally {
      setDrinksLoading(false);
    }
  }, [supabase, player?.id, profiles]);

  useEffect(() => {
    if (player?.id && !tournamentLoading) {
      fetchDrinks();
    }
  }, [fetchDrinks, player?.id, tournamentLoading]);

  // Show loading only while auth or tournament is loading
  const isLoading = authLoading || tournamentLoading || scoresLoading;

  const handleAddDrink = async (drinkType: string) => {
    if (!player?.id || isDrinksLocked) return;
    setIsSaving(drinkType);

    const { error } = await supabase
      .from('drinks')
      .insert({
        tournament_id: SSS_TOURNAMENT_ID,
        user_id: player.id,
        drink_type: drinkType,
        count: 1,
      } as Record<string, unknown>);

    if (error) {
      toast.error('Error al registrar', { description: error.message });
    } else {
      // Create event
      await supabase.from('events_feed').insert({
        tournament_id: SSS_TOURNAMENT_ID,
        event_type: 'drink',
        actor_user_id: player.id,
        payload: { drink_type: drinkType },
      } as Record<string, unknown>);

      setMyDrinks(prev => ({
        ...prev,
        [drinkType]: (prev[drinkType] || 0) + 1,
      }));

      toast.success(`${DRINK_EMOJIS[drinkType]} ¡+${DRINK_POINTS[drinkType]} pts para ${myTeamName}!`);
      fetchDrinks();
      refetchScores(); // Refresh team scores
    }
    setIsSaving(null);
  };

  const totalDrinks = Object.values(myDrinks).reduce((a, b) => a + b, 0);

  if (isLoading || tournamentLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Contador de Copas
        </h1>
        <Badge variant="outline" className="text-lg px-3 py-1 gap-2">
          <Beer className="w-4 h-4" />
          {totalDrinks}
        </Badge>
      </div>

      {/* Team Impact Card */}
      <Card 
        className="border-2 shadow-elevation-md"
        style={{ borderColor: myTeamColor + '40', backgroundColor: myTeamColor + '08' }}
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: myTeamColor + '20' }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: myTeamColor }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: myTeamColor }}>{myTeamName}</p>
                <p className="text-xs text-muted-foreground">
                  {myTeamScore.totalDrinks} copas = <span className="font-bold">{myTeamScore.drinks.toFixed(1)} pts</span>
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>🍺 +0.1 | 🥃 +0.2</p>
              <p>🍸 +0.5 | 🫗 +0.7</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add - BOTONES GRANDES */}
      <Card className={`bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border-amber-500/30 shadow-elevation-lg ${isDrinksLocked ? 'opacity-90' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            {isDrinksLocked ? (
              <Lock className="w-5 h-5 text-slate-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-500" />
            )}
            Registrar Consumición
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isDrinksLocked ? (
              <span className="inline-flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                Bloqueado hasta el viernes 30 Enero a las 19:00
              </span>
            ) : (
              'Cada consumición suma puntos al marcador'
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {DRINK_TYPES.map((type) => (
              <Button
                key={type}
                variant="outline"
                className={`h-28 flex flex-col gap-2 border-2 rounded-2xl transition-all duration-200 relative overflow-hidden ${
                  isDrinksLocked 
                    ? 'opacity-60 cursor-not-allowed hover:bg-transparent hover:border-slate-200' 
                    : 'hover:bg-amber-500/15 hover:border-amber-500/60 active:scale-95'
                }`}
                onClick={() => handleAddDrink(type)}
                disabled={isDrinksLocked || isSaving === type}
              >
                {isSaving === type ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <span className="text-4xl">{DRINK_EMOJIS[type]}</span>
                    <span className="text-sm font-medium">{DRINK_LABELS[type]}</span>
                    <span className="text-xs text-amber-600 font-bold">+{DRINK_POINTS[type]} pts</span>
                    {myDrinks[type] > 0 && !isDrinksLocked && (
                      <Badge 
                        className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2"
                      >
                        ×{myDrinks[type]}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mi Contador de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {totalDrinks === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no has registrado ninguna copa hoy
            </p>
          ) : (
            <div className="flex items-center justify-center gap-4 py-2">
              {Object.entries(myDrinks).map(([type, count]) => (
                <div key={type} className="text-center">
                  <span className="text-3xl">{DRINK_EMOJIS[type]}</span>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDrinks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nadie ha registrado copas aún
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recentDrinks.map((drink) => (
                <div 
                  key={drink.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <span className="text-2xl">{DRINK_EMOJIS[drink.drink_type] || '🥤'}</span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {drink.profile?.nickname || drink.profile?.display_name || 'Alguien'}
                      </span>
                      {' '}se ha tomado {drink.count > 1 ? `${drink.count}x ` : ''}{(DRINK_LABELS[drink.drink_type] || drink.drink_type).toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(drink.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
