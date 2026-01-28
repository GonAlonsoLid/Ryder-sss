'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, BarChart3, Beer, MapPin, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio', emoji: '🏠' },
  { href: '/tournament', icon: Trophy, label: 'Torneo', emoji: '🏆' },
  { href: '/leaderboards', icon: BarChart3, label: 'Ranking', emoji: '📊' },
  { href: '/drinks', icon: Beer, label: 'Copas', emoji: '🍺' },
  { href: '/clubs', icon: MapPin, label: 'Campos', emoji: '⛳' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-[68px] max-w-lg mx-auto px-3 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 rounded-xl mx-0.5',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-slate-500 hover:text-primary hover:bg-primary/5 active:scale-95'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 transition-all duration-200',
                isActive && 'scale-110 drop-shadow-sm'
              )} />
              <span className={cn(
                'text-[10px] font-medium transition-all',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 rounded-xl mx-0.5',
            pathname === '/settings'
              ? 'text-primary bg-primary/10' 
              : 'text-slate-500 hover:text-primary hover:bg-primary/5 active:scale-95'
          )}
        >
          <Settings className={cn(
            'w-5 h-5 transition-all duration-200',
            pathname === '/settings' && 'scale-110 drop-shadow-sm'
          )} />
          <span className={cn(
            'text-[10px] font-medium transition-all',
            pathname === '/settings' && 'font-semibold'
          )}>
            Config
          </span>
        </Link>
      </div>
    </nav>
  );
}

