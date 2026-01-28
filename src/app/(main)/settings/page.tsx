'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, LogOut, Shield, Save, Lock, Camera, Upload } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { TEAM_JORGE_ID } from '@/lib/constants';
import { PlayerAvatar } from '@/components/ui/player-avatar';

export default function SettingsPage() {
  const router = useRouter();
  const { player, isAdmin, isLoading: authLoading, logout, updateProfile, isAuthenticated } = useSimpleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    avatar_url: '',
  });
  const [newSecretWord, setNewSecretWord] = useState('');
  const supabase = getSupabaseClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Update form data when player loads
  useEffect(() => {
    if (player) {
      setFormData({
        nickname: player.nickname || '',
        avatar_url: player.avatar_url || '',
      });
    }
  }, [player]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !player?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${player.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Auto-save the new avatar to database
      const result = await updateProfile({ avatar_url: publicUrl });
      
      if (result.success) {
        toast.success('Foto actualizada correctamente');
      } else {
        toast.error('Foto subida, pero error al guardar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!player?.id) return;
    setIsLoading(true);

    const result = await updateProfile({
      nickname: formData.nickname,
      avatar_url: formData.avatar_url,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success('Perfil actualizado');
    } else {
      toast.error('Error al guardar', { description: result.error });
    }
  };

  const handleChangeSecretWord = async () => {
    if (!newSecretWord.trim()) {
      toast.error('Introduce una nueva palabra secreta');
      return;
    }

    setIsLoading(true);

    const result = await updateProfile({
      secret_word: newSecretWord.trim(),
    });

    setIsLoading(false);

    if (result.success) {
      toast.success('Palabra secreta actualizada');
      setNewSecretWord('');
    } else {
      toast.error('Error al cambiar', { description: result.error });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isTeamJorge = player?.team_id === TEAM_JORGE_ID;
  const teamName = isTeamJorge ? 'Pimentonas' : 'Tabaqueras';
  const teamColor = isTeamJorge ? '#EF4444' : '#3B82F6';

  // Show loading while auth is loading
  if (authLoading || !player) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <PlayerAvatar
              avatarUrl={formData.avatar_url || player.avatar_url}
              name={player.display_name}
              size="lg"
              teamColor={teamColor}
            />
            <div className="flex-1">
              <CardTitle className="text-xl">{player.display_name}</CardTitle>
              {player.nickname && (
                <p className="text-sm text-muted-foreground">"{player.nickname}"</p>
              )}
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline"
                  style={{ borderColor: teamColor, color: teamColor }}
                >
                  {teamName}
                </Badge>
                {player.handicap && (
                  <Badge variant="secondary">HCP {player.handicap}</Badge>
                )}
                {isAdmin && (
                  <Badge variant="default" className="bg-amber-500">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </CardDescription>
              {player.bio && (
                <p className="text-sm text-muted-foreground mt-3 italic">
                  "{player.bio}"
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Editar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Apodo</Label>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder="Tu apodo..."
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <PlayerAvatar
                  avatarUrl={formData.avatar_url}
                  name={player.display_name}
                  size="lg"
                  teamColor={teamColor}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploading}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      Cambiar Foto
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o GIF. Máx 2MB.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full h-12"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Change Secret Word */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Cambiar Palabra Secreta
          </CardTitle>
          <CardDescription>
            Esta es la clave que usas para entrar a la app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newSecretWord">Nueva palabra secreta</Label>
            <Input
              id="newSecretWord"
              type="password"
              value={newSecretWord}
              onChange={(e) => setNewSecretWord(e.target.value)}
              placeholder="Nueva palabra secreta..."
              className="h-12"
            />
          </div>

          <Button 
            onClick={handleChangeSecretWord} 
            disabled={isLoading || !newSecretWord.trim()}
            variant="outline"
            className="w-full h-12"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Cambiar Palabra Secreta
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Admin Link */}
      {isAdmin && (
        <>
          <Link href="/admin">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 py-4">
                <Shield className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Panel de Administración</p>
                  <p className="text-xs text-muted-foreground">Gestionar torneo, rondas y trofeos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <div className="h-6" />
        </>
      )}

      {/* Logout */}
      <Button 
        variant="destructive" 
        className="w-full h-12"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar Sesión
      </Button>

      <p className="text-xs text-center text-muted-foreground pt-4">
        SSS Ryder v1.0.0 • Hecho con RUINA para los SSS
      </p>
    </PageContainer>
  );
}
