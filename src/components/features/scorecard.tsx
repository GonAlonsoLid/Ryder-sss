'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { VALDECANAS_HOLES, getScoreColor, VALDECANAS_TOTAL_PAR } from '@/lib/constants';
import type { HoleScore, Profile } from '@/types/database';

interface ScorecardProps {
  matchId: string;
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  playerAColor: string;
  playerBColor: string;
  canEdit: boolean;
}

export function Scorecard({
  matchId,
  playerAId,
  playerBId,
  playerAName,
  playerBName,
  playerAColor,
  playerBColor,
  canEdit,
}: ScorecardProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);

  const supabase = getSupabaseClient();

  // Fetch existing scores
  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('match_id', matchId);

      if (data) {
        const scoreMap: Record<string, number> = {};
        (data as HoleScore[]).forEach(s => {
          scoreMap[`${s.hole_number}-${s.player_id}`] = s.strokes;
        });
        setScores(scoreMap);
        
        // Find the last hole with scores to set current
        for (let i = 18; i >= 1; i--) {
          if (scoreMap[`${i}-${playerAId}`] || scoreMap[`${i}-${playerBId}`]) {
            setCurrentHole(Math.min(i + 1, 18));
            break;
          }
        }
      }
      setIsLoading(false);
    };

    fetchScores();
  }, [supabase, matchId, playerAId, playerBId]);

  // Calculate totals
  const playerATotal = VALDECANAS_HOLES.reduce((sum, h) => sum + (scores[`${h.hole}-${playerAId}`] || 0), 0);
  const playerBTotal = VALDECANAS_HOLES.reduce((sum, h) => sum + (scores[`${h.hole}-${playerBId}`] || 0), 0);

  const handleScoreChange = (hole: number, playerId: string, delta: number) => {
    const key = `${hole}-${playerId}`;
    const currentScore = scores[key] || 0;
    const newScore = Math.max(0, currentScore + delta);
    setScores(prev => ({ ...prev, [key]: newScore }));
  };

  const handleSetScore = (hole: number, playerId: string, value: number) => {
    const key = `${hole}-${playerId}`;
    setScores(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleSaveHole = async (hole: number) => {
    setIsSaving(true);

    const playerAScore = scores[`${hole}-${playerAId}`] || 0;
    const playerBScore = scores[`${hole}-${playerBId}`] || 0;

    // Upsert both scores
    const { error } = await supabase
      .from('hole_scores')
      .upsert([
        { match_id: matchId, hole_number: hole, player_id: playerAId, strokes: playerAScore },
        { match_id: matchId, hole_number: hole, player_id: playerBId, strokes: playerBScore },
      ], { onConflict: 'match_id,hole_number,player_id' });

    if (error) {
      toast.error('Error al guardar');
    } else {
      toast.success(`Hoyo ${hole} guardado`);
      // Move to next hole
      if (hole < 18) {
        setCurrentHole(hole + 1);
      }
    }

    setIsSaving(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    const allScores = VALDECANAS_HOLES.flatMap(h => [
      { match_id: matchId, hole_number: h.hole, player_id: playerAId, strokes: scores[`${h.hole}-${playerAId}`] || 0 },
      { match_id: matchId, hole_number: h.hole, player_id: playerBId, strokes: scores[`${h.hole}-${playerBId}`] || 0 },
    ]).filter(s => s.strokes > 0);

    if (allScores.length === 0) {
      toast.error('No hay scores para guardar');
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('hole_scores')
      .upsert(allScores, { onConflict: 'match_id,hole_number,player_id' });

    if (error) {
      toast.error('Error al guardar');
    } else {
      toast.success('Scorecard guardado');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const currentHoleInfo = VALDECANAS_HOLES[currentHole - 1];

  return (
    <div className="space-y-4">
      {/* Current Hole Entry */}
      {canEdit && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentHole === 1}
                onClick={() => setCurrentHole(h => h - 1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Hoyo {currentHole}
                </CardTitle>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <Badge variant="outline">Par {currentHoleInfo.par}</Badge>
                  <Badge variant="secondary">{currentHoleInfo.distance}m</Badge>
                  <Badge variant="secondary">HCP {currentHoleInfo.strokeIndex}</Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={currentHole === 18}
                onClick={() => setCurrentHole(h => h + 1)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Player A Score */}
            <div className="space-y-2">
              <label className="text-sm font-bold" style={{ color: playerAColor }}>
                {playerAName}
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-14 w-14 text-xl"
                  onClick={() => handleScoreChange(currentHole, playerAId, -1)}
                  disabled={!scores[`${currentHole}-${playerAId}`]}
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <div 
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-black ${
                      scores[`${currentHole}-${playerAId}`] 
                        ? getScoreColor(scores[`${currentHole}-${playerAId}`], currentHoleInfo.par)
                        : 'bg-muted text-muted-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {scores[`${currentHole}-${playerAId}`] || '-'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="h-14 w-14 text-xl"
                  onClick={() => handleScoreChange(currentHole, playerAId, 1)}
                >
                  +
                </Button>
              </div>
              {/* Quick buttons */}
              <div className="flex justify-center gap-2">
                {[currentHoleInfo.par - 1, currentHoleInfo.par, currentHoleInfo.par + 1, currentHoleInfo.par + 2].map(v => (
                  <Button
                    key={v}
                    variant={scores[`${currentHole}-${playerAId}`] === v ? 'default' : 'outline'}
                    size="sm"
                    className="w-12"
                    onClick={() => handleSetScore(currentHole, playerAId, v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t my-4" />

            {/* Player B Score */}
            <div className="space-y-2">
              <label className="text-sm font-bold" style={{ color: playerBColor }}>
                {playerBName}
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-14 w-14 text-xl"
                  onClick={() => handleScoreChange(currentHole, playerBId, -1)}
                  disabled={!scores[`${currentHole}-${playerBId}`]}
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <div 
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-black ${
                      scores[`${currentHole}-${playerBId}`] 
                        ? getScoreColor(scores[`${currentHole}-${playerBId}`], currentHoleInfo.par)
                        : 'bg-muted text-muted-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {scores[`${currentHole}-${playerBId}`] || '-'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="h-14 w-14 text-xl"
                  onClick={() => handleScoreChange(currentHole, playerBId, 1)}
                >
                  +
                </Button>
              </div>
              {/* Quick buttons */}
              <div className="flex justify-center gap-2">
                {[currentHoleInfo.par - 1, currentHoleInfo.par, currentHoleInfo.par + 1, currentHoleInfo.par + 2].map(v => (
                  <Button
                    key={v}
                    variant={scores[`${currentHole}-${playerBId}`] === v ? 'default' : 'outline'}
                    size="sm"
                    className="w-12"
                    onClick={() => handleSetScore(currentHole, playerBId, v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleSaveHole(currentHole)}
              disabled={isSaving}
              className="w-full h-12 mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Hoyo {currentHole}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full Scorecard Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tarjeta Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1 font-bold">Hoyo</th>
                  {VALDECANAS_HOLES.slice(0, 9).map(h => (
                    <th key={h.hole} className="text-center py-2 px-1 w-8">{h.hole}</th>
                  ))}
                  <th className="text-center py-2 px-1 font-bold bg-muted">OUT</th>
                </tr>
              </thead>
              <tbody>
                {/* Par row */}
                <tr className="border-b bg-slate-50">
                  <td className="py-2 px-1 font-medium text-xs text-muted-foreground">PAR</td>
                  {VALDECANAS_HOLES.slice(0, 9).map(h => (
                    <td key={h.hole} className="text-center py-2 px-1 text-xs text-muted-foreground">{h.par}</td>
                  ))}
                  <td className="text-center py-2 px-1 font-bold text-xs bg-muted">
                    {VALDECANAS_HOLES.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                  </td>
                </tr>
                {/* Player A */}
                <tr className="border-b">
                  <td className="py-2 px-1 font-medium truncate max-w-[60px]" style={{ color: playerAColor }}>
                    {playerAName.split(' ')[0]}
                  </td>
                  {VALDECANAS_HOLES.slice(0, 9).map(h => {
                    const score = scores[`${h.hole}-${playerAId}`];
                    return (
                      <td key={h.hole} className="text-center py-2 px-1">
                        {score ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${getScoreColor(score, h.par)}`}>
                            {score}
                          </span>
                        ) : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-1 font-bold bg-muted">
                    {VALDECANAS_HOLES.slice(0, 9).reduce((s, h) => s + (scores[`${h.hole}-${playerAId}`] || 0), 0) || '-'}
                  </td>
                </tr>
                {/* Player B */}
                <tr>
                  <td className="py-2 px-1 font-medium truncate max-w-[60px]" style={{ color: playerBColor }}>
                    {playerBName.split(' ')[0]}
                  </td>
                  {VALDECANAS_HOLES.slice(0, 9).map(h => {
                    const score = scores[`${h.hole}-${playerBId}`];
                    return (
                      <td key={h.hole} className="text-center py-2 px-1">
                        {score ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${getScoreColor(score, h.par)}`}>
                            {score}
                          </span>
                        ) : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-1 font-bold bg-muted">
                    {VALDECANAS_HOLES.slice(0, 9).reduce((s, h) => s + (scores[`${h.hole}-${playerBId}`] || 0), 0) || '-'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Back 9 */}
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1 font-bold">Hoyo</th>
                  {VALDECANAS_HOLES.slice(9, 18).map(h => (
                    <th key={h.hole} className="text-center py-2 px-1 w-8">{h.hole}</th>
                  ))}
                  <th className="text-center py-2 px-1 font-bold bg-muted">IN</th>
                  <th className="text-center py-2 px-1 font-bold bg-primary/10">TOT</th>
                </tr>
              </thead>
              <tbody>
                {/* Par row */}
                <tr className="border-b bg-slate-50">
                  <td className="py-2 px-1 font-medium text-xs text-muted-foreground">PAR</td>
                  {VALDECANAS_HOLES.slice(9, 18).map(h => (
                    <td key={h.hole} className="text-center py-2 px-1 text-xs text-muted-foreground">{h.par}</td>
                  ))}
                  <td className="text-center py-2 px-1 font-bold text-xs bg-muted">
                    {VALDECANAS_HOLES.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                  </td>
                  <td className="text-center py-2 px-1 font-bold text-xs bg-primary/10">
                    {VALDECANAS_TOTAL_PAR}
                  </td>
                </tr>
                {/* Player A */}
                <tr className="border-b">
                  <td className="py-2 px-1 font-medium truncate max-w-[60px]" style={{ color: playerAColor }}>
                    {playerAName.split(' ')[0]}
                  </td>
                  {VALDECANAS_HOLES.slice(9, 18).map(h => {
                    const score = scores[`${h.hole}-${playerAId}`];
                    return (
                      <td key={h.hole} className="text-center py-2 px-1">
                        {score ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${getScoreColor(score, h.par)}`}>
                            {score}
                          </span>
                        ) : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-1 font-bold bg-muted">
                    {VALDECANAS_HOLES.slice(9, 18).reduce((s, h) => s + (scores[`${h.hole}-${playerAId}`] || 0), 0) || '-'}
                  </td>
                  <td className="text-center py-2 px-1 font-bold bg-primary/10">
                    {playerATotal || '-'}
                  </td>
                </tr>
                {/* Player B */}
                <tr>
                  <td className="py-2 px-1 font-medium truncate max-w-[60px]" style={{ color: playerBColor }}>
                    {playerBName.split(' ')[0]}
                  </td>
                  {VALDECANAS_HOLES.slice(9, 18).map(h => {
                    const score = scores[`${h.hole}-${playerBId}`];
                    return (
                      <td key={h.hole} className="text-center py-2 px-1">
                        {score ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${getScoreColor(score, h.par)}`}>
                            {score}
                          </span>
                        ) : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-1 font-bold bg-muted">
                    {VALDECANAS_HOLES.slice(9, 18).reduce((s, h) => s + (scores[`${h.hole}-${playerBId}`] || 0), 0) || '-'}
                  </td>
                  <td className="text-center py-2 px-1 font-bold bg-primary/10">
                    {playerBTotal || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          {(playerATotal > 0 || playerBTotal > 0) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-2">Resultado</p>
              <div className="flex items-center justify-center gap-6">
                <div style={{ color: playerAColor }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{playerATotal}</p>
                  <p className="text-xs">{playerAName}</p>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div style={{ color: playerBColor }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{playerBTotal}</p>
                  <p className="text-xs">{playerBName}</p>
                </div>
              </div>
              {playerATotal !== playerBTotal && (
                <p className="mt-2 text-sm font-bold">
                  {playerATotal < playerBTotal 
                    ? `${playerAName} gana por ${playerBTotal - playerATotal} golpes`
                    : `${playerBName} gana por ${playerATotal - playerBTotal} golpes`
                  }
                </p>
              )}
            </div>
          )}

          {canEdit && (
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              variant="outline"
              className="w-full mt-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Todo
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

