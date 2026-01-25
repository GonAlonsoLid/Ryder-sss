'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { TEAM_JORGE_ID } from '@/lib/constants';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'SSS Ryder', showProfile = true }: HeaderProps) {
  const { player: profile, isAdmin } = useSimpleAuth();
  
  const teamColor = profile?.team_id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <Image 
              src="/icons/icon.png?v=2" 
              alt="SSS" 
              width={32} 
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <span className="font-semibold tracking-tight">{title}</span>
        </Link>

        {/* Profile */}
        {showProfile && profile && (
          <Link href="/settings" className="flex items-center gap-2">
            {isAdmin && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                Admin
              </Badge>
            )}
            <PlayerAvatar
              avatarUrl={profile.avatar_url}
              name={profile.display_name}
              size="sm"
              teamColor={teamColor}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
