'use client';

import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  avatarUrl: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  teamColor?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-3xl',
};

export function PlayerAvatar({ 
  avatarUrl, 
  name, 
  size = 'md', 
  teamColor = '#6B7280',
  className 
}: PlayerAvatarProps) {
  // Detectar si es una URL de imagen o un emoji
  const isImageUrl = avatarUrl?.startsWith('http') || avatarUrl?.startsWith('/');
  const isEmoji = avatarUrl && !isImageUrl && avatarUrl.length <= 4;
  
  const baseClasses = cn(
    'rounded-2xl flex items-center justify-center overflow-hidden',
    sizeClasses[size],
    className
  );

  // Si es URL de imagen: foto con contorno del color del equipo
  if (isImageUrl && avatarUrl) {
    return (
      <div 
        className={baseClasses}
        style={{ 
          backgroundColor: `${teamColor}15`,
          border: `2px solid ${teamColor}`
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={avatarUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Si es emoji
  if (isEmoji) {
    return (
      <div 
        className={baseClasses}
        style={{ 
          backgroundColor: `${teamColor}15`,
          border: `2px solid ${teamColor}`
        }}
      >
        {avatarUrl}
      </div>
    );
  }

  // Fallback: inicial del nombre
  return (
    <div 
      className={cn(baseClasses, 'font-bold')}
      style={{ 
        backgroundColor: `${teamColor}20`,
        border: `2px solid ${teamColor}`,
        color: teamColor
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

