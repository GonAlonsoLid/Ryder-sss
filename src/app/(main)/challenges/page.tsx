'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useTournament } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Target, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { SSS_TOURNAMENT_ID, CHALLENGE_STATUS_LABELS, CHALLENGE_TYPE_LABELS } from '@/lib/constants';
import type { Challenge, ChallengeAssignment, Profile } from '@/types/database';

interface AssignmentWithDetails extends ChallengeAssignment {
  challenge?: Challenge;
  assigned_to_user?: Profile;
  validated_by_user?: Profile;
}

interface AssignmentRow {
  id: string;
  challenge_id: string;
  assigned_to_user_id: string | null;
  assigned_to_team_id: string | null;
  status: string;
  validated_by_user_id: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function ChallengesPage() {
  const { player, isAdmin, isLoading: authLoading } = useSimpleAuth();
  const { profiles, isLoading: tournamentLoading } = useTournament();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myAssignments, setMyAssignments] = useState<AssignmentWithDetails[]>([]);
  const [allAssignments, setAllAssignments] = useState<AssignmentWithDetails[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [challengesRes, assignmentsRes] = await Promise.all([
        supabase
          .from('challenges')
          .select('*')
          .eq('tournament_id', SSS_TOURNAMENT_ID)
          .eq('is_active', true)
          .order('created_at'),
        supabase
          .from('challenge_assignments')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const challengesList = (challengesRes.data || []) as Challenge[];
      setChallenges(challengesList);
      
      if (assignmentsRes.data) {
        const assignmentsWithDetails = (assignmentsRes.data as AssignmentRow[]).map(a => ({
          ...a,
          status: a.status as ChallengeAssignment['status'],
          challenge: challengesList.find(c => c.id === a.challenge_id),
          assigned_to_user: profiles.find(p => p.id === a.assigned_to_user_id),
          validated_by_user: profiles.find(p => p.id === a.validated_by_user_id),
        })) as AssignmentWithDetails[];
        
        setAllAssignments(assignmentsWithDetails);
        setMyAssignments(assignmentsWithDetails.filter(a => a.assigned_to_user_id === player?.id));
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setDataLoading(false);
    }
  }, [supabase, profiles, player?.id]);

  useEffect(() => {
    if (!tournamentLoading) {
      fetchData();
    }
  }, [fetchData, tournamentLoading]);

  const isLoading = authLoading || tournamentLoading;

  const handleValidate = async (assignmentId: string, success: boolean) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden validar retos');
      return;
    }
    setValidatingId(assignmentId);
    const assignment = allAssignments.find(a => a.id === assignmentId);
    
    const { error } = await supabase
      .from('challenge_assignments')
      .update({
        status: success ? 'completed' : 'failed',
        validated_by_user_id: player?.id,
        completed_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', assignmentId);

    if (error) {
      toast.error('Error al validar');
    } else {
      // Create event
      await supabase.from('events_feed').insert({
        tournament_id: SSS_TOURNAMENT_ID,
        event_type: success ? 'challenge_completed' : 'challenge_failed',
        actor_user_id: assignment?.assigned_to_user_id,
        payload: { title: assignment?.challenge?.title },
      } as Record<string, unknown>);

      toast.success(success ? '¡Reto completado!' : 'Reto fallido');
      fetchData();
    }
    setValidatingId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Retos</h1>
        <Badge variant="outline">
          {myAssignments.filter(a => a.status === 'assigned').length} activos
        </Badge>
      </div>

      <Tabs defaultValue="mine">
        <TabsList className={isAdmin ? 'grid w-full grid-cols-3' : 'grid w-full grid-cols-2'}>
          <TabsTrigger value="mine">Mis Retos</TabsTrigger>
          {isAdmin && <TabsTrigger value="validate">Validar</TabsTrigger>}
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>

        {/* My Challenges */}
        <TabsContent value="mine" className="mt-4 space-y-3">
          {myAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No tienes retos asignados aún
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  El admin te asignará retos durante el finde
                </p>
              </CardContent>
            </Card>
          ) : (
            myAssignments.map((assignment) => (
              <Card 
                key={assignment.id}
                className={`border ${
                  assignment.status === 'assigned' ? 'border-yellow-500/50' : ''
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(assignment.status)}
                        <h3 className="font-semibold">{assignment.challenge?.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.challenge?.description}
                      </p>
                      {assignment.challenge?.penalty_text && (
                        <p className="text-xs text-red-400 mt-2">
                          ⚠️ {assignment.challenge.penalty_text}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(assignment.status)}>
                        {CHALLENGE_STATUS_LABELS[assignment.status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        +{assignment.challenge?.points_fun} pts
                      </p>
                    </div>
                  </div>
                  {assignment.status !== 'assigned' && assignment.validated_by_user && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Validado por {assignment.validated_by_user.nickname || assignment.validated_by_user.display_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Validate Others - solo admins */}
        {isAdmin && (
        <TabsContent value="validate" className="mt-4 space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground text-center">
                🎯 Como admin, puedes validar los retos asignados
              </p>
            </CardContent>
          </Card>

          {allAssignments
            .filter(a => a.status === 'assigned' && a.assigned_to_user_id !== player?.id)
            .map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Reto de {assignment.assigned_to_user?.nickname || assignment.assigned_to_user?.display_name}
                      </p>
                      <h3 className="font-semibold">{assignment.challenge?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.challenge?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleValidate(assignment.id, true)}
                      disabled={validatingId === assignment.id}
                    >
                      {validatingId === assignment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completado
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleValidate(assignment.id, false)}
                      disabled={validatingId === assignment.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Fallido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          {allAssignments.filter(a => a.status === 'assigned' && a.assigned_to_user_id !== player?.id).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No hay retos pendientes de validar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}

        {/* Challenge Catalog */}
        <TabsContent value="catalog" className="mt-4 space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground text-center">
                📚 Biblioteca de retos disponibles
              </p>
            </CardContent>
          </Card>

          {challenges.map((challenge) => (
            <Card 
              key={challenge.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedChallenge(challenge)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CHALLENGE_TYPE_LABELS[challenge.challenge_type]}
                    </Badge>
                    <Badge variant="secondary">
                      +{challenge.points_fun}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Challenge Detail Dialog */}
      <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedChallenge?.title}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className="mt-2">
                {selectedChallenge && CHALLENGE_TYPE_LABELS[selectedChallenge.challenge_type]}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selectedChallenge?.description}</p>
            {selectedChallenge?.penalty_text && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-sm text-red-400">
                  ⚠️ Penalización: {selectedChallenge.penalty_text}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Puntos a tu equipo RUIN</span>
              <span className="text-lg font-bold text-primary">+{selectedChallenge?.points_fun}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
