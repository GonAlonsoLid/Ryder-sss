'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, Sparkles } from 'lucide-react';
import { TEAM_JORGE_ID } from '@/lib/constants';

const AVATARS = ['🏌️', '⛳', '🎯', '🏆', '🦅', '🐦', '🔥', '💪', '🎪', '🎩', '🌶️', '🚬', '🍺', '🎸', '🎲'];

export default function OnboardingPage() {
  const router = useRouter();
  const { player, isLoading: authLoading, isAuthenticated, updateProfile } = useSimpleAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nickname: '',
    avatar: '🏌️',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect if already has nickname
  useEffect(() => {
    if (!authLoading && player?.nickname) {
      router.push('/dashboard');
    }
  }, [authLoading, player, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nickname.trim()) {
      toast.error('El apodo es obligatorio, ¡ponle gracia!');
      return;
    }

    setIsLoading(true);

    const result = await updateProfile({
      nickname: formData.nickname.trim(),
      avatar_url: formData.avatar,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success('¡Perfil completado!', {
        description: 'Bienvenido a la SSS Ryder Cup',
      });
      router.push('/dashboard');
    } else {
      toast.error('Error al guardar', {
        description: result.error,
      });
    }
  };

  if (authLoading || !player) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isTeamJorge = player.team_id === TEAM_JORGE_ID;
  const teamName = isTeamJorge ? 'Pimentonas' : 'Tabaqueras';
  const teamColor = isTeamJorge ? '#EF4444' : '#3B82F6';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 shadow-lg mb-4 overflow-hidden">
            <img 
              src="/icons/icon.png" 
              alt="SSS Ryder Cup" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold">¡Hola {player.display_name}!</h1>
          <p className="text-slate-500 mt-1 text-sm">Configura tu perfil para el torneo</p>
        </div>

        {/* Player Info */}
        <div 
          className="mb-6 p-4 rounded-xl border-2 flex items-center gap-4"
          style={{ backgroundColor: `${teamColor}10`, borderColor: `${teamColor}40` }}
        >
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${teamColor}20`, border: `2px solid ${teamColor}` }}
          >
            {formData.avatar}
          </div>
          <div>
            <p className="font-bold text-lg">{player.display_name}</p>
            <p className="text-sm" style={{ color: teamColor }}>{teamName}</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Personaliza tu perfil
            </CardTitle>
            <CardDescription>
              Esto verán los demás en el leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="font-semibold">
                  Apodo / Alias *
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="El Tigre, Putt Master, etc."
                  required
                  className="h-12"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Algo memorable para el finde 😎
                </p>
              </div>

              {/* Avatar */}
              <div className="space-y-3">
                <Label className="font-semibold">Avatar</Label>
                <div className="flex flex-wrap gap-2 justify-center p-4 bg-slate-50 rounded-xl">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                      className={`w-12 h-12 text-xl rounded-xl border-2 transition-all duration-200 ${
                        formData.avatar === emoji
                          ? 'border-primary bg-primary/10 scale-110 shadow-lg'
                          : 'border-slate-200 hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    🏌️ ¡Listo para jugar!
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-6 text-xs text-slate-500 text-center">
          SSS Ryder Cup 2026 • La Vera
        </p>
      </div>
    </div>
  );
}
