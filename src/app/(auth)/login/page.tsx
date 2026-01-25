'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth, getAvailablePlayers } from '@/hooks/use-simple-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trophy, Sparkles, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react';
import { TEAM_JORGE_ID } from '@/lib/constants';
import type { Profile } from '@/types/database';

type PlayerOption = Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'team_id' | 'nickname' | 'secret_word' | 'handicap'>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useSimpleAuth();
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption | null>(null);
  const [secretWord, setSecretWord] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      const data = await getAvailablePlayers();
      setPlayers(data);
      setLoadingPlayers(false);
    };
    fetchPlayers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlayer) {
      toast.error('Selecciona quién eres');
      return;
    }

    if (!secretWord.trim()) {
      toast.error('Introduce tu palabra secreta');
      return;
    }

    setIsLoading(true);

    const result = await login(selectedPlayer.id, secretWord.trim());

    setIsLoading(false);

    if (result.success) {
      toast.success('¡Bienvenido!', {
        description: `Hola ${selectedPlayer.nickname || selectedPlayer.display_name}`,
      });
      router.push('/dashboard');
    } else {
      toast.error('Error al entrar', {
        description: result.error,
      });
    }
  };

  const isFirstTime = selectedPlayer && !selectedPlayer.secret_word;

  // Group players by team
  const pimentonas = players.filter(p => p.team_id === TEAM_JORGE_ID);
  const tabaqueras = players.filter(p => p.team_id !== TEAM_JORGE_ID && p.team_id);

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-900 shadow-elevation-lg mb-4 overflow-hidden">
            <img 
              src="/icons/icon.png" 
              alt="SSS Ryder Cup" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              SSS RYDER CUP
            </h1>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Accede con tu nombre y palabra secreta</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-elevation-xl border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Trophy className="w-5 h-5 text-primary" />
              {selectedPlayer ? 'Introduce tu clave' : '¿Quién eres?'}
            </CardTitle>
            <CardDescription>
              {selectedPlayer 
                ? isFirstTime 
                  ? 'Primera vez - elige una palabra secreta que recordarás'
                  : 'Introduce la palabra secreta que elegiste'
                : 'Selecciona tu nombre de la lista'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedPlayer ? (
              // Player Selection
              <div className="space-y-4">
                {loadingPlayers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Pimentonas */}
                    <div>
                      <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        PIMENTONAS
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {pimentonas.map((player) => (
                          <Button
                            key={player.id}
                            variant="outline"
                            className="h-16 justify-start gap-3 border-2 hover:border-red-400 hover:bg-red-50 transition-all"
                            onClick={() => setSelectedPlayer(player)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-sm font-bold text-red-600">
                              {player.display_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium truncate text-sm">{player.display_name}</span>
                              {player.handicap && (
                                <span className="text-xs text-slate-500">HCP {player.handicap}</span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Tabaqueras */}
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        TABAQUERAS
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {tabaqueras.map((player) => (
                          <Button
                            key={player.id}
                            variant="outline"
                            className="h-16 justify-start gap-3 border-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                            onClick={() => setSelectedPlayer(player)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-sm font-bold text-blue-600">
                              {player.display_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium truncate text-sm">{player.display_name}</span>
                              {player.handicap && (
                                <span className="text-xs text-slate-500">HCP {player.handicap}</span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Secret Word Input
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Selected Player */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
                    style={{ 
                      backgroundColor: selectedPlayer.team_id === TEAM_JORGE_ID ? '#EF444420' : '#3B82F620',
                      border: `2px solid ${selectedPlayer.team_id === TEAM_JORGE_ID ? '#EF4444' : '#3B82F6'}`,
                      color: selectedPlayer.team_id === TEAM_JORGE_ID ? '#EF4444' : '#3B82F6'
                    }}
                  >
                    {selectedPlayer.display_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{selectedPlayer.display_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{selectedPlayer.team_id === TEAM_JORGE_ID ? 'Pimentonas' : 'Tabaqueras'}</span>
                      {selectedPlayer.handicap && (
                        <>
                          <span>•</span>
                          <span>HCP {selectedPlayer.handicap}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedPlayer(null);
                      setSecretWord('');
                    }}
                  >
                    Cambiar
                  </Button>
                </div>

                {/* Secret Word */}
                <div className="space-y-2">
                  <Label htmlFor="secretWord" className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isFirstTime ? 'Elige tu palabra secreta' : 'Palabra secreta'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="secretWord"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isFirstTime ? 'Algo que solo tú sepas...' : '••••••••'}
                      value={secretWord}
                      onChange={(e) => setSecretWord(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-14 text-base border-2 focus:border-primary transition-colors pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isFirstTime && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                      Primera vez: recuerda esta palabra, la necesitarás para volver a entrar
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold shadow-elevation-md hover:shadow-elevation-lg transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      {isFirstTime ? 'Crear acceso y entrar' : 'Entrar'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-xs text-slate-500 text-center">
          SSS Ryder Cup 2026 • La Vera
        </p>
      </div>
    </div>
  );
}
