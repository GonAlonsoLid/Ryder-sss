'use client';

import Link from 'next/link';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TEAM_JORGE_ID } from '@/lib/constants';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function Header({ title = 'SSS Ryder', showProfile = true }: HeaderProps) {
  const { player: profile, isAdmin } = useSimpleAuth();
  
  const teamColor = profile?.team_id === TEAM_JORGE_ID ? 'bg-red-600' : 'bg-blue-600';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden">
            <img src="/icons/icon.png" alt="SSS" className="w-full h-full object-cover" />
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
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border-2" style={{ borderColor: profile.team_id === TEAM_JORGE_ID ? '#DC2626' : '#2563EB' }}>
                <AvatarFallback className={`text-sm ${teamColor} text-white`}>
                  {profile.avatar_url || profile.nickname?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

