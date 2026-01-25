'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Loader2, Shield, Users, Trophy, Target, Settings, 
  ChevronLeft, UserPlus, Award, Check
} from 'lucide-react';
import Link from 'next/link';
import { SSS_TOURNAMENT_ID, TEAM_JORGE_ID, TEAM_YAGO_ID } from '@/lib/constants';
import type { Challenge, Trophy as TrophyType, Profile, Match } from '@/types/database';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useSimpleAuth();
  const { teams, profiles, rounds } = useTournament();
  const [matches, setMatches] = useState<Match[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dialogs
  const [assignChallengeOpen, setAssignChallengeOpen] = useState(false);
  const [assignTrophyOpen, setAssignTrophyOpen] = useState(false);
  const [editMatchOpen, setEditMatchOpen] = useState<Match | null>(null);
  
  // Form state
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTrophy, setSelectedTrophy] = useState('');
  const [selectedWinnerUser, setSelectedWinnerUser] = useState('');
  const [selectedWinnerTeam, setSelectedWinnerTeam] = useState('');
  
  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    const [matchesRes, challengesRes, trophiesRes] = await Promise.all([
      supabase.from('matches').select('*').order('created_at'),
      supabase.from('challenges').select('*').eq('tournament_id', SSS_TOURNAMENT_ID),
      supabase.from('trophies').select('*').eq('tournament_id', SSS_TOURNAMENT_ID),
    ]);

    if (matchesRes.data) setMatches(matchesRes.data as Match[]);
    if (challengesRes.data) setChallenges(challengesRes.data as Challenge[]);
    if (trophiesRes.data) setTrophies(trophiesRes.data as TrophyType[]);
    
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin, router, fetchData]);

  const handleAssignChallenge = async () => {
    if (!selectedChallenge || !selectedUser) {
      toast.error('Selecciona reto y jugador');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('challenge_assignments')
      .insert({
        challenge_id: selectedChallenge,
        assigned_to_user_id: selectedUser,
        status: 'assigned',
      } as Record<string, unknown>);

    if (error) {
      toast.error('Error al asignar', { description: error.message });
    } else {
      toast.success('Reto asignado');
      setAssignChallengeOpen(false);
      setSelectedChallenge('');
      setSelectedUser('');
    }
    setIsSaving(false);
  };

  const handleAssignTrophy = async () => {
    if (!selectedTrophy) {
      toast.error('Selecciona un trofeo');
      return;
    }

    if (!selectedWinnerUser && !selectedWinnerTeam) {
      toast.error('Selecciona un ganador');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('trophies')
      .update({
        winner_user_id: selectedWinnerUser || null,
        winner_team_id: selectedWinnerTeam || null,
      } as Record<string, unknown>)
      .eq('id', selectedTrophy);

    if (error) {
      toast.error('Error al asignar', { description: error.message });
    } else {
      // Create event
      const trophy = trophies.find(t => t.id === selectedTrophy);
      await supabase.from('events_feed').insert({
        tournament_id: SSS_TOURNAMENT_ID,
        event_type: 'trophy_awarded',
        actor_user_id: selectedWinnerUser || null,
        payload: { title: trophy?.title },
      } as Record<string, unknown>);

      toast.success('Trofeo asignado');
      setAssignTrophyOpen(false);
      setSelectedTrophy('');
      setSelectedWinnerUser('');
      setSelectedWinnerTeam('');
      fetchData();
    }
    setIsSaving(false);
  };

  const handleUpdateMatchPlayers = async (match: Match, teamAPlayers: string[], teamBPlayers: string[]) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('matches')
      .update({
        team_a_players: teamAPlayers,
        team_b_players: teamBPlayers,
      } as Record<string, unknown>)
      .eq('id', match.id);

    if (error) {
      toast.error('Error al actualizar');
    } else {
      toast.success('Partido actualizado');
      setEditMatchOpen(null);
      fetchData();
    }
    setIsSaving(false);
  };

  const handleSetUserRole = async (userId: string, role: 'admin' | 'player') => {
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role } as Record<string, unknown>)
      .eq('id', userId);

    if (error) {
      toast.error('Error al cambiar rol');
    } else {
      toast.success(`Rol cambiado a ${role}`);
    }
    setIsSaving(false);
  };

  if (authLoading || isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const teamJorgePlayers = profiles.filter(p => p.team_id === TEAM_JORGE_ID);
  const teamYagoPlayers = profiles.filter(p => p.team_id === TEAM_YAGO_ID);

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="players">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="players">
            <Users className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="matches">
            <Settings className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="trophies">
            <Trophy className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        {/* Players Tab */}
        <TabsContent value="players" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jugadores Registrados</CardTitle>
              <CardDescription>
                {profiles.length} jugadores • Puedes cambiar roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profiles.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ 
                        backgroundColor: player.team_id === TEAM_JORGE_ID ? '#DC262620' : '#2563EB20'
                      }}
                    >
                      {player.avatar_url || '👤'}
                    </div>
                    <div>
                      <p className="font-medium">{player.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.nickname || 'Sin apodo'} • {player.team_id === TEAM_JORGE_ID ? 'Pimentonas' : player.team_id ? 'Tabaqueras' : 'Sin equipo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.role === 'admin' ? (
                      <Badge className="bg-primary">Admin</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetUserRole(player.id, 'admin')}
                        disabled={isSaving}
                      >
                        Hacer Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurar Matches</CardTitle>
              <CardDescription>
                Asigna jugadores a los partidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rounds.map((round) => {
                const roundMatches = matches.filter(m => m.round_id === round.id);
                return (
                  <div key={round.id}>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      {round.name}
                    </p>
                    {roundMatches.map((match, idx) => (
                      <div 
                        key={match.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-2"
                      >
                        <div className="flex-1">
                          <p className="text-sm">Partido {idx + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {match.team_a_players.length > 0 
                              ? match.team_a_players.map(id => profiles.find(p => p.id === id)?.nickname || '?').join(' & ')
                              : 'Sin asignar'
                            }
                            {' vs '}
                            {match.team_b_players.length > 0 
                              ? match.team_b_players.map(id => profiles.find(p => p.id === id)?.nickname || '?').join(' & ')
                              : 'Sin asignar'
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMatchOpen(match)}
                        >
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-4 space-y-4">
          <Button 
            className="w-full"
            onClick={() => setAssignChallengeOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Asignar Reto
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biblioteca de Retos</CardTitle>
              <CardDescription>
                {challenges.length} retos disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>
                    <Badge variant="secondary">+{challenge.points_fun}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trophies Tab */}
        <TabsContent value="trophies" className="mt-4 space-y-4">
          <Button 
            className="w-full"
            onClick={() => setAssignTrophyOpen(true)}
          >
            <Award className="w-4 h-4 mr-2" />
            Asignar Trofeo
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trofeos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trophies.map((trophy) => (
                <div 
                  key={trophy.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{trophy.emoji}</span>
                    <div>
                      <p className="font-medium">{trophy.title}</p>
                      {(trophy.winner_user_id || trophy.winner_team_id) ? (
                        <p className="text-xs text-green-500">
                          ✓ Asignado
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Pendiente
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Challenge Dialog */}
      <Dialog open={assignChallengeOpen} onOpenChange={setAssignChallengeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Reto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reto</label>
              <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un reto" />
                </SelectTrigger>
                <SelectContent>
                  {challenges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jugador</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un jugador" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nickname || p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignChallengeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignChallenge} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asignar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Trophy Dialog */}
      <Dialog open={assignTrophyOpen} onOpenChange={setAssignTrophyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Trofeo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trofeo</label>
              <Select value={selectedTrophy} onValueChange={setSelectedTrophy}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un trofeo" />
                </SelectTrigger>
                <SelectContent>
                  {trophies.filter(t => !t.winner_user_id && !t.winner_team_id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.emoji} {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ganador (Jugador)</label>
              <Select value={selectedWinnerUser} onValueChange={(v) => {
                setSelectedWinnerUser(v);
                setSelectedWinnerTeam('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un jugador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nickname || p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">O Ganador (Equipo)</label>
              <Select value={selectedWinnerTeam} onValueChange={(v) => {
                setSelectedWinnerTeam(v);
                setSelectedWinnerUser('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTrophyOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignTrophy} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asignar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog open={!!editMatchOpen} onOpenChange={() => setEditMatchOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Partido</DialogTitle>
          </DialogHeader>
          {editMatchOpen && (
            <EditMatchForm 
              match={editMatchOpen}
              teamJorgePlayers={teamJorgePlayers}
              teamYagoPlayers={teamYagoPlayers}
              onSave={handleUpdateMatchPlayers}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// Separate component for edit match form
function EditMatchForm({ 
  match, 
  teamJorgePlayers, 
  teamYagoPlayers,
  onSave,
  isSaving
}: { 
  match: Match;
  teamJorgePlayers: Profile[];
  teamYagoPlayers: Profile[];
  onSave: (match: Match, teamA: string[], teamB: string[]) => void;
  isSaving: boolean;
}) {
  const [teamA, setTeamA] = useState<string[]>(match.team_a_players || []);
  const [teamB, setTeamB] = useState<string[]>(match.team_b_players || []);

  const isTeamJorgeA = match.team_a_id === TEAM_JORGE_ID;
  const playersA = isTeamJorgeA ? teamJorgePlayers : teamYagoPlayers;
  const playersB = isTeamJorgeA ? teamYagoPlayers : teamJorgePlayers;

  const togglePlayer = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamA(prev => 
        prev.includes(playerId) 
          ? prev.filter(id => id !== playerId)
          : [...prev, playerId]
      );
    } else {
      setTeamB(prev => 
        prev.includes(playerId) 
          ? prev.filter(id => id !== playerId)
          : [...prev, playerId]
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: isTeamJorgeA ? '#DC2626' : '#2563EB' }}>
          {isTeamJorgeA ? 'Pimentonas' : 'Tabaqueras'}
        </label>
        <div className="flex flex-wrap gap-2">
          {playersA.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={teamA.includes(p.id) ? 'default' : 'outline'}
              onClick={() => togglePlayer(p.id, 'A')}
            >
              {teamA.includes(p.id) && <Check className="w-3 h-3 mr-1" />}
              {p.nickname || p.display_name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" style={{ color: isTeamJorgeA ? '#2563EB' : '#DC2626' }}>
          {isTeamJorgeA ? 'Tabaqueras' : 'Pimentonas'}
        </label>
        <div className="flex flex-wrap gap-2">
          {playersB.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={teamB.includes(p.id) ? 'default' : 'outline'}
              onClick={() => togglePlayer(p.id, 'B')}
            >
              {teamB.includes(p.id) && <Check className="w-3 h-3 mr-1" />}
              {p.nickname || p.display_name}
            </Button>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button 
          onClick={() => onSave(match, teamA, teamB)} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
        </Button>
      </DialogFooter>
    </div>
  );
}
