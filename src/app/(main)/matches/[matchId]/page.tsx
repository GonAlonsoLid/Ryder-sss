'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, Save, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { TEAM_JORGE_ID, SSS_TOURNAMENT_ID } from '@/lib/constants';
import type { Match, Round, MatchStatus, MatchResult } from '@/types/database';

const MATCHPLAY_SCORE_OPTIONS = [
  'AS', '1UP', '2UP', '3UP', '4UP', '5UP', '6UP', '7UP', '8UP', '9UP', '10UP',
  '1&0', '2&1', '3&2', '4&3', '5&4', '6&5', '7&6', '8&7', '9&8', '10&8'
];

const QUICK_SCORE_BUTTONS = [
  { label: '-1', value: '1DOWN', color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30', action: 'decrease', icon: '◀' },
  { label: 'AS', value: 'AS', color: 'bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-lg shadow-slate-500/30', action: 'all_square', icon: '●' },
  { label: '+1', value: '1UP', color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30', action: 'increase', icon: '▶' },
];

// For stroke play quick buttons
const STROKE_BUTTONS = [
  { label: '-1', color: 'bg-red-500 hover:bg-red-600', delta: -1 },
  { label: '+1', color: 'bg-green-500 hover:bg-green-600', delta: 1 },
];

export default function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const { player, isAdmin } = useSimpleAuth();
  const { teams, profiles } = useTournament();
  const [match, setMatch] = useState<Match | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    status: 'pending' as MatchStatus,
    score_display: 'AS',
    holes_played: 0,
    result: 'in_progress' as MatchResult,
    team_a_strokes: 0,
    team_b_strokes: 0,
  });

  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchData) {
        const m = matchData as Match;
        setMatch(m);
        setFormData({
          status: m.status,
          score_display: m.score_display,
          holes_played: m.holes_played,
          result: m.result,
          team_a_strokes: m.team_a_strokes || 0,
          team_b_strokes: m.team_b_strokes || 0,
        });

        const { data: roundData } = await supabase
          .from('rounds')
          .select('*')
          .eq('id', m.round_id)
          .single();
        
        if (roundData) setRound(roundData as Round);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, matchId]);

  // Check if user can edit this match
  const canEdit = isAdmin || 
    match?.team_a_players?.includes(player?.id || '') || 
    match?.team_b_players?.includes(player?.id || '');

  const getPlayerNames = (playerIds: string[]): string[] => {
    if (!playerIds || playerIds.length === 0) return ['Sin asignar'];
    return playerIds.map(id => {
      const player = profiles.find(p => p.id === id);
      return player?.nickname || player?.display_name || 'Desconocido';
    });
  };

  const handleStartMatch = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('matches')
      .update({ status: 'in_progress' } as Record<string, unknown>)
      .eq('id', matchId);

    if (error) {
      toast.error('Error al iniciar el partido');
    } else {
      setMatch(prev => prev ? { ...prev, status: 'in_progress' } : null);
      setFormData(prev => ({ ...prev, status: 'in_progress' }));
      
      // Create event
      await supabase.from('events_feed').insert({
        tournament_id: SSS_TOURNAMENT_ID,
        event_type: 'match_started',
        actor_user_id: player?.id,
        payload: { match_id: matchId, description: round?.name },
      } as Record<string, unknown>);
      
      toast.success('¡Partido iniciado!');
    }
    setIsSaving(false);
  };

  // Check if this is stroke play (singles format)
  const isStrokePlay = round?.format === 'singles';

  const handleSaveScore = async () => {
    setIsSaving(true);

    // Calculate points based on result
    let team_a_points = 0;
    let team_b_points = 0;
    let finalResult = formData.result;
    let scoreDisplay = formData.score_display;
    
    // For stroke play, calculate result from strokes
    if (isStrokePlay && formData.status === 'completed') {
      scoreDisplay = `${formData.team_a_strokes} - ${formData.team_b_strokes}`;
      
      if (formData.team_a_strokes < formData.team_b_strokes) {
        finalResult = 'team_a_win';
        team_a_points = match?.points_value || 1;
      } else if (formData.team_b_strokes < formData.team_a_strokes) {
        finalResult = 'team_b_win';
        team_b_points = match?.points_value || 1;
      } else {
        finalResult = 'draw';
        team_a_points = (match?.points_value || 1) / 2;
        team_b_points = (match?.points_value || 1) / 2;
      }
    } else if (formData.status === 'completed') {
      // Matchplay scoring
      if (formData.result === 'team_a_win') {
        team_a_points = match?.points_value || 1;
      } else if (formData.result === 'team_b_win') {
        team_b_points = match?.points_value || 1;
      } else if (formData.result === 'draw') {
        team_a_points = (match?.points_value || 1) / 2;
        team_b_points = (match?.points_value || 1) / 2;
      }
    }

    // For stroke play in progress, show current strokes
    if (isStrokePlay && formData.status === 'in_progress') {
      scoreDisplay = `${formData.team_a_strokes} - ${formData.team_b_strokes}`;
    }

    const { error } = await supabase
      .from('matches')
      .update({
        status: formData.status,
        score_display: scoreDisplay,
        holes_played: formData.holes_played,
        result: finalResult,
        team_a_points,
        team_b_points,
        team_a_strokes: formData.team_a_strokes,
        team_b_strokes: formData.team_b_strokes,
      } as Record<string, unknown>)
      .eq('id', matchId);

    if (error) {
      toast.error('Error al guardar', { description: error.message });
    } else {
      // Create audit log
      await supabase.from('match_updates').insert({
        match_id: matchId,
        updated_by: player?.id,
        payload: {
          score_display: scoreDisplay,
          holes_played: formData.holes_played,
          status: formData.status,
          result: finalResult,
          team_a_strokes: formData.team_a_strokes,
          team_b_strokes: formData.team_b_strokes,
        },
      } as Record<string, unknown>);

      // Create event
      await supabase.from('events_feed').insert({
        tournament_id: SSS_TOURNAMENT_ID,
        event_type: formData.status === 'completed' ? 'match_completed' : 'score_update',
        actor_user_id: player?.id,
        payload: { 
          match_id: matchId, 
          score: scoreDisplay,
          description: round?.name,
        },
      } as Record<string, unknown>);

      setMatch(prev => prev ? { 
        ...prev, 
        status: formData.status,
        score_display: scoreDisplay,
        holes_played: formData.holes_played,
        result: finalResult,
        team_a_strokes: formData.team_a_strokes,
        team_b_strokes: formData.team_b_strokes,
        team_a_points,
        team_b_points,
      } : null);
      
      toast.success('¡Marcador actualizado!');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer>
        <p className="text-center text-muted-foreground">Partido no encontrado</p>
      </PageContainer>
    );
  }

  const teamA = teams.find(t => t.id === match.team_a_id);
  const teamB = teams.find(t => t.id === match.team_b_id);
  const teamAPlayers = getPlayerNames(match.team_a_players);
  const teamBPlayers = getPlayerNames(match.team_b_players);

  return (
    <PageContainer className="space-y-4">
      {/* Back Button */}
      <Link href={`/rounds/${match.round_id}`}>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
      </Link>

      {/* Match Header - Enhanced */}
      <Card className="shadow-elevation-xl border-2 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 pt-6 pb-8">
          <CardContent className="pt-0">
            <div className="text-center mb-8">
              <Badge 
                variant="outline" 
                className="mb-4 text-sm px-4 py-1 bg-white/80 backdrop-blur-sm"
              >
                {round?.name}
              </Badge>
              
              {/* SCORE GIGANTE */}
              <div 
                className={`text-8xl font-black mb-3 transition-all duration-300 ${
                  match.status === 'in_progress' 
                    ? 'text-primary drop-shadow-lg' 
                    : 'text-foreground'
                }`}
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: match.status === 'in_progress' ? '0 0 30px rgba(79,70,229,0.3)' : 'none'
                }}
              >
                {formData.score_display}
              </div>
              
              {/* Progress indicator visual */}
              {formData.holes_played > 0 && (
                <div className="max-w-[200px] mx-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Hoyo {formData.holes_played}</span>
                    <span>18</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                      style={{ width: `${(formData.holes_played / 18) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="flex-1 text-center">
              <div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2"
                style={{ 
                  backgroundColor: teamA?.id === TEAM_JORGE_ID ? '#DC262620' : '#2563EB20',
                  border: `2px solid ${teamA?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB'}`
                }}
              >
                <span className="font-bold" style={{ color: teamA?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}>
                  {match.team_a_points}
                </span>
              </div>
              {teamAPlayers.map((name, i) => (
                <p key={i} className="text-sm font-medium">{name}</p>
              ))}
              <p className="text-xs text-muted-foreground mt-1">{teamA?.name}</p>
            </div>

            <div className="px-4">
              <p className="text-muted-foreground text-sm">VS</p>
            </div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2"
                style={{ 
                  backgroundColor: teamB?.id === TEAM_JORGE_ID ? '#DC262620' : '#2563EB20',
                  border: `2px solid ${teamB?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB'}`
                }}
              >
                <span className="font-bold" style={{ color: teamB?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}>
                  {match.team_b_points}
                </span>
              </div>
              {teamBPlayers.map((name, i) => (
                <p key={i} className="text-sm font-medium">{name}</p>
              ))}
              <p className="text-xs text-muted-foreground mt-1">{teamB?.name}</p>
            </div>
          </div>
          </CardContent>
        </div>
      </Card>

      {/* Actions - Enhanced */}
      {canEdit && (
        <Card className="shadow-elevation-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Actualizar Marcador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {match.status === 'pending' && (
              <Button 
                onClick={handleStartMatch} 
                className="w-full h-14 text-base font-semibold shadow-elevation-md"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                Iniciar Partido
              </Button>
            )}

            {match.status !== 'pending' && (
              <>
                {/* STROKE PLAY UI (Singles) */}
                {isStrokePlay ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-4">
                        Stroke Play - Golpes Totales
                      </Badge>
                    </div>
                    
                    {/* Team A Strokes */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold block" style={{ color: teamA?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}>
                        {teamAPlayers.join(' & ')}
                      </label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, team_a_strokes: Math.max(0, prev.team_a_strokes - 1) }))}
                          className="h-16 w-16 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center">
                          <span 
                            className="text-6xl font-black"
                            style={{ fontFamily: 'var(--font-display)', color: teamA?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}
                          >
                            {formData.team_a_strokes}
                          </span>
                          <p className="text-sm text-muted-foreground">golpes</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, team_a_strokes: prev.team_a_strokes + 1 }))}
                          className="h-16 w-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="text-center text-muted-foreground text-sm font-bold">VS</div>

                    {/* Team B Strokes */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold block" style={{ color: teamB?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}>
                        {teamBPlayers.join(' & ')}
                      </label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, team_b_strokes: Math.max(0, prev.team_b_strokes - 1) }))}
                          className="h-16 w-16 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center">
                          <span 
                            className="text-6xl font-black"
                            style={{ fontFamily: 'var(--font-display)', color: teamB?.id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}
                          >
                            {formData.team_b_strokes}
                          </span>
                          <p className="text-sm text-muted-foreground">golpes</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, team_b_strokes: prev.team_b_strokes + 1 }))}
                          className="h-16 w-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Difference indicator */}
                    {formData.team_a_strokes > 0 || formData.team_b_strokes > 0 ? (
                      <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm text-muted-foreground">Diferencia</p>
                        <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                          {formData.team_a_strokes === formData.team_b_strokes 
                            ? 'EMPATE'
                            : formData.team_a_strokes < formData.team_b_strokes
                              ? `${teamAPlayers[0]} gana por ${formData.team_b_strokes - formData.team_a_strokes}`
                              : `${teamBPlayers[0]} gana por ${formData.team_a_strokes - formData.team_b_strokes}`
                          }
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  /* MATCHPLAY UI (Scramble) */
                  <>
                    {/* Quick Score Buttons - SUPER GRANDE */}
                    <div className="space-y-4">
                      <label className="text-base font-bold block text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Marcador Rápido
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {QUICK_SCORE_BUTTONS.map((btn) => (
                          <Button
                            key={btn.value}
                            onClick={() => {
                              if (btn.action === 'decrease') {
                                const currentIndex = MATCHPLAY_SCORE_OPTIONS.indexOf(formData.score_display);
                                if (currentIndex > 0) {
                                  setFormData(prev => ({ ...prev, score_display: MATCHPLAY_SCORE_OPTIONS[currentIndex - 1] }));
                                }
                              } else if (btn.action === 'all_square') {
                                setFormData(prev => ({ ...prev, score_display: 'AS' }));
                              } else if (btn.action === 'increase') {
                                const currentIndex = MATCHPLAY_SCORE_OPTIONS.indexOf(formData.score_display);
                                if (currentIndex < MATCHPLAY_SCORE_OPTIONS.length - 1) {
                                  setFormData(prev => ({ ...prev, score_display: MATCHPLAY_SCORE_OPTIONS[currentIndex + 1] }));
                                }
                              }
                            }}
                            className={`h-24 min-h-[96px] text-3xl font-black text-white transition-all duration-200 active:scale-90 rounded-2xl ${btn.color}`}
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-4xl">{btn.label}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Toca para ajustar el marcador
                      </p>
                    </div>

                    {/* Score Display - Full Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Marcador Completo</label>
                      <Select
                        value={formData.score_display}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, score_display: value }))}
                      >
                        <SelectTrigger className="h-14 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATCHPLAY_SCORE_OPTIONS.map((score) => (
                            <SelectItem key={score} value={score} className="text-base py-3">
                              {score}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Holes Played */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Hoyos jugados</label>
                  <Select
                    value={formData.holes_played.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, holes_played: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-14 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 19 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()} className="text-base py-3">
                          Hoyo {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status / Result */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Estado del Partido</label>
                  <Select
                    value={formData.status === 'completed' ? formData.result : formData.status}
                    onValueChange={(value) => {
                      if (value === 'in_progress') {
                        setFormData(prev => ({ ...prev, status: 'in_progress', result: 'in_progress' }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          status: 'completed', 
                          result: value as MatchResult
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-14 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress" className="text-base py-3">En juego</SelectItem>
                      <SelectItem value="team_a_win" className="text-base py-3">
                        Victoria {teamAPlayers.join(' & ')}
                      </SelectItem>
                      <SelectItem value="team_b_win" className="text-base py-3">
                        Victoria {teamBPlayers.join(' & ')}
                      </SelectItem>
                      <SelectItem value="draw" className="text-base py-3">Empate (1/2 punto cada uno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSaveScore} 
                  className="w-full h-14 text-base font-semibold shadow-elevation-md"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : formData.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {formData.status === 'completed' ? 'Finalizar Partido' : 'Guardar Marcador'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!canEdit && (
        <p className="text-center text-sm text-muted-foreground">
          Solo los participantes o admins pueden editar este partido
        </p>
      )}
    </PageContainer>
  );
}
