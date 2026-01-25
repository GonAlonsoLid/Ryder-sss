'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Flame, Zap, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[80px]" />
        
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        
        {/* Logo with Glow */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-amber-400/40 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl shadow-slate-400/30 overflow-hidden ring-4 ring-amber-400/30">
            <img 
              src="/icons/icon.png" 
              alt="SSS Ryder Cup" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Epic Title */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-amber-600 text-sm font-bold tracking-[0.3em] uppercase">
              1ª Edición
            </span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 tracking-tighter mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            RYDER CUP
          </h1>
          
          <p className="text-slate-500 text-lg tracking-wide font-medium">
            La Vera • Enero 2026
          </p>
        </div>

        {/* VS Battle Section */}
        <div className="my-10 w-full max-w-lg">
          <div className="relative flex items-center justify-center gap-4 md:gap-8">
            {/* Team Pimentonas */}
            <div className="flex-1 text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-2xl bg-gradient-to-br from-white to-red-50 border-2 border-red-300 flex items-center justify-center shadow-xl shadow-red-200/50 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-red-300/50 group-hover:border-red-400">
                  <img 
                    src="/logos/pimentonas.png" 
                    alt="Pimentonas" 
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              </div>
              <p className="mt-4 text-lg md:text-xl font-black text-red-600 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                PIMENTONAS
              </p>
              <p className="text-xs text-slate-500 mt-1">Capitán: Yago</p>
            </div>

            {/* VS Badge */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-300/50 ring-4 ring-white">
                <span className="text-2xl md:text-3xl font-black text-white drop-shadow-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  VS
                </span>
              </div>
            </div>

            {/* Team Tabaqueras */}
            <div className="flex-1 text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-2xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 flex items-center justify-center shadow-xl shadow-blue-200/50 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-300/50 group-hover:border-blue-400">
                  <img 
                    src="/logos/tabaqueras.png" 
                    alt="Tabaqueras" 
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              </div>
              <p className="mt-4 text-lg md:text-xl font-black text-blue-600 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                TABAQUERAS
              </p>
              <p className="text-xs text-slate-500 mt-1">Capitán: Jorge</p>
            </div>
          </div>
        </div>

        {/* Trophy Divider */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-amber-400 rounded-full" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div className="w-16 h-[2px] bg-gradient-to-l from-transparent via-amber-400 to-amber-400 rounded-full" />
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-2xl shadow-slate-400/30 border-0 transition-all duration-300 hover:scale-105 hover:shadow-slate-500/40 ring-4 ring-slate-200"
          onClick={() => router.push('/login')}
        >
          <Zap className="w-5 h-5 mr-2 text-amber-400" />
          ENTRAR AL TORNEO
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Footer */}
        <p className="mt-10 text-xs text-slate-400 tracking-widest uppercase font-medium">
          Solo para miembros del grupo SSS
        </p>

        {/* Floating Elements */}
        <div className="absolute bottom-8 left-8 text-slate-400 text-xs hidden md:flex flex-col gap-1.5">
          <p>10 jugadores</p>
          <p>2 campos</p>
          <p>1 campeón</p>
        </div>
        
        <div className="absolute bottom-8 right-8 text-slate-400 text-xs text-right hidden md:flex flex-col gap-1.5">
          <p>Talayuela Golf Club</p>
          <p>Isla de Valdecañas</p>
        </div>
      </div>
    </div>
  );
}
