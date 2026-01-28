'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTournament, useMatches } from '@/hooks/use-tournament';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Calendar, MapPin, Sun, Cloud, CloudRain, Thermometer, Wind, ChevronRight, Flag, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TEAM_JORGE_ID, ROUND_FORMAT_LABELS } from '@/lib/constants';

// Fechas del torneo - Último finde de enero 2026
const SATURDAY = new Date('2026-01-31');
const SUNDAY = new Date('2026-02-01');

// Información de los campos
const CLUB_INFO: Record<string, { 
  name: string; 
  location: string; 
  image: string;
  holes: number;
  par: number;
  length: string;
  description: string;
  weather: { temp: number; condition: 'sunny' | 'cloudy' | 'rainy'; wind: number };
  teeTime: string;
}> = {
  'scramble': {
    name: 'Golf Isla de Valdecañas',
    location: 'El Gordo, Cáceres',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=400&fit=crop',
    holes: 18,
    par: 72,
    length: '6.400m',
    description: 'Espectacular campo en una isla privada. Vistas al embalse y diseño championship.',
    weather: { temp: 14, condition: 'sunny', wind: 8 },
    teeTime: '09:00',
  },
  'singles': {
    name: 'Golf Isla de Valdecañas',
    location: 'El Gordo, Cáceres',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop',
    holes: 18,
    par: 72,
    length: '6.400m',
    description: 'Espectacular campo en una isla privada. Vistas al embalse y diseño championship.',
    weather: { temp: 16, condition: 'sunny', wind: 12 },
    teeTime: '09:30',
  },
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type TournamentPhase = 'before' | 'saturday' | 'sunday' | 'finished';

export default function TournamentPage() {
  const { tournament, teams, rounds, profiles, isLoading } = useTournament();
  const { matches } = useMatches();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [phase, setPhase] = useState<TournamentPhase>('before');

  // Determinar fase del torneo y calcular countdown
  useEffect(() => {
    const updatePhase = () => {
      const now = new Date();
      
      // Fechas exactas del torneo - 31 enero y 1 febrero 2026
      const saturdayStart = new Date('2026-01-31T00:00:00');
      const saturdayEnd = new Date('2026-01-31T23:59:59');
      const sundayStart = new Date('2026-02-01T00:00:00');
      const sundayEnd = new Date('2026-02-01T23:59:59');
      
      if (now >= saturdayStart && now <= saturdayEnd) {
        // Es sábado 7 de febrero 2026
        setPhase('saturday');
        setTimeLeft(null);
      } else if (now >= sundayStart && now <= sundayEnd) {
        // Es domingo 8 de febrero 2026
        setPhase('sunday');
        setTimeLeft(null);
      } else if (now > sundayEnd) {
        // El torneo ya terminó
        setPhase('finished');
        setTimeLeft(null);
      } else {
        // Todavía no ha empezado - mostrar countdown
        setPhase('before');
        const target = new Date('2026-01-31T09:00:00');
        const difference = target.getTime() - now.getTime();
        
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      }
    };

    updatePhase();
    const timer = setInterval(updatePhase, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-400" />;
      default: return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  const getWeatherLabel = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'Soleado';
      case 'cloudy': return 'Nublado';
      case 'rainy': return 'Lluvia';
      default: return 'Despejado';
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  const teamJorge = teams.find(t => t.id === TEAM_JORGE_ID);
  const teamYago = teams.find(t => t.id !== TEAM_JORGE_ID);

  // Datos según fase
  const currentClub = phase === 'sunday' ? CLUB_INFO['singles'] : CLUB_INFO['scramble'];
  const currentRoundName = phase === 'sunday' ? 'R2: Singles' : 'R1: Scramble';
  const currentRound = rounds.find(r => r.name === currentRoundName);

  // Puntos de golf
  const getGolfPoints = (teamId: string) => {
    let points = 0;
    matches.forEach(m => {
      if (m.status === 'completed') {
        if (m.team_a_id === teamId) points += m.team_a_points || 0;
        if (m.team_b_id === teamId) points += m.team_b_points || 0;
      }
    });
    return points;
  };

  const pimentonasGolf = getGolfPoints(TEAM_JORGE_ID);
  const tabaquerasGolf = getGolfPoints(teamYago?.id || '');
  
  const currentRoundMatches = currentRound ? matches.filter(m => m.round_id === currentRound.id) : [];
  const liveMatches = currentRoundMatches.filter(m => m.status === 'in_progress').length;
  const completedMatches = currentRoundMatches.filter(m => m.status === 'completed').length;

  return (
    <PageContainer className="space-y-5 pb-24">
      
      {/* ===================== */}
      {/* FASE 1: ANTES DEL TORNEO - Countdown + Preview siguiente ronda */}
      {/* ===================== */}
      {phase === 'before' && timeLeft && (
        <>
          {/* Countdown con fondo oscuro para contraste */}
          <Card className="overflow-hidden border-0 shadow-elevation-lg bg-slate-900 text-white">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Image src="/icons/icon.png?v=2" alt="SSS" width={40} height={40} unoptimized />
                  <div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      SSS Ryder Weekend
                    </h2>
                    <p className="text-slate-400 text-xs">1ª Edición • La Vera</p>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Comienza en</p>
                
                <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                  {[
                    { value: timeLeft.days, label: 'Días' },
                    { value: timeLeft.hours, label: 'Horas' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Seg' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                      <p className="text-4xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.value.toString().padStart(2, '0')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-slate-500 text-sm mt-6">
                  31 Enero - 1 Febrero 2026
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview de la primera ronda */}
          <Card className="overflow-hidden border-0 shadow-elevation-md">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={CLUB_INFO['scramble'].image} 
                alt={CLUB_INFO['scramble'].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Badge className="bg-emerald-600 text-white mb-2">Sábado - Ronda 1</Badge>
                <h3 className="text-lg font-bold text-white">{CLUB_INFO['scramble'].name}</h3>
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {CLUB_INFO['scramble'].location}
                </p>
              </div>
            </div>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground mb-4">{CLUB_INFO['scramble'].description}</p>
              
              {/* Condiciones */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl">
                <div className="text-center">
                  {getWeatherIcon(CLUB_INFO['scramble'].weather.condition)}
                  <p className="text-xs mt-1">{getWeatherLabel(CLUB_INFO['scramble'].weather.condition)}</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-5 h-5 mx-auto text-orange-500" />
                  <p className="text-xs mt-1">{CLUB_INFO['scramble'].weather.temp}°C</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 mx-auto text-slate-500" />
                  <p className="text-xs mt-1">{CLUB_INFO['scramble'].weather.wind} km/h</p>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="text-xs mt-1">{CLUB_INFO['scramble'].teeTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ===================== */}
      {/* FASE 2 & 3: DÍA DEL TORNEO - Live Location + Marcador en vivo */}
      {/* ===================== */}
      {(phase === 'saturday' || phase === 'sunday') && (
        <>
          {/* Live Location Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl text-white shadow-elevation-lg">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-200 text-xs uppercase tracking-wider">Ahora mismo en</p>
              <h2 className="text-lg font-bold">{currentClub.name}</h2>
              <p className="text-emerald-100 text-sm">{currentClub.location}</p>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {phase === 'saturday' ? 'R1' : 'R2'}
            </Badge>
          </div>

          {/* Marcador en VIVO */}
          <Card className="border-2 border-emerald-500/30 shadow-elevation-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">EN VIVO</span>
              </div>
              <span className="text-slate-400 text-xs">
                {completedMatches}/{currentRoundMatches.length} partidos
              </span>
            </div>
            
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                {/* Pimentonas */}
                <div className="text-center flex-1">
                  {teamJorge?.logo_url ? (
                    <div className="w-20 h-20 mx-auto mb-2 rounded-2xl overflow-hidden bg-red-50 flex items-center justify-center border-2 border-red-300 shadow-md">
                      <img src={teamJorge.logo_url} alt="Pimentonas" className="w-full h-full object-contain p-2" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-red-100 border-2 border-red-300">
                      <span className="text-red-600 font-bold text-2xl">P</span>
                    </div>
                  )}
                  <p className="font-bold">Pimentonas</p>
                  <p className="text-5xl font-black mt-2" style={{ color: '#DC2626', fontFamily: 'var(--font-display)' }}>
                    {pimentonasGolf}
                  </p>
                </div>

                {/* VS */}
                <div className="px-4 text-center">
                  <p className="text-4xl font-black text-slate-200" style={{ fontFamily: 'var(--font-display)' }}>-</p>
                  {liveMatches > 0 && (
                    <Badge variant="destructive" className="mt-2 animate-pulse">
                      {liveMatches} jugando
                    </Badge>
                  )}
                </div>

                {/* Tabaqueras */}
                <div className="text-center flex-1">
                  {teamYago?.logo_url ? (
                    <div className="w-20 h-20 mx-auto mb-2 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center border-2 border-blue-300 shadow-md">
                      <img src={teamYago.logo_url} alt="Tabaqueras" className="w-full h-full object-contain p-2" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-blue-100 border-2 border-blue-300">
                      <span className="text-blue-600 font-bold text-2xl">T</span>
                    </div>
                  )}
                  <p className="font-bold">Tabaqueras</p>
                  <p className="text-5xl font-black mt-2" style={{ color: '#2563EB', fontFamily: 'var(--font-display)' }}>
                    {tabaquerasGolf}
                  </p>
                </div>
              </div>

              {/* Link a partidos */}
              {currentRound && (
                <Link href={`/rounds/${currentRound.id}`} className="block mt-6">
                  <div className="flex items-center justify-between p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Ver todos los partidos</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Condiciones del día */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-4">
              <p className="text-xs font-medium text-amber-800 mb-3 uppercase">Condiciones de hoy</p>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  {getWeatherIcon(currentClub.weather.condition)}
                  <p className="text-xs mt-1 font-medium">{getWeatherLabel(currentClub.weather.condition)}</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-5 h-5 mx-auto text-orange-500" />
                  <p className="text-xs mt-1 font-medium">{currentClub.weather.temp}°C</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 mx-auto text-slate-600" />
                  <p className="text-xs mt-1 font-medium">{currentClub.weather.wind} km/h</p>
                </div>
                <div className="text-center">
                  <Flag className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="text-xs mt-1 font-medium">Par {currentClub.par}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ===================== */}
      {/* FASE 4: TORNEO FINALIZADO */}
      {/* ===================== */}
      {phase === 'finished' && (
        <Card className="bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-300 shadow-elevation-lg">
          <CardContent className="py-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Torneo Finalizado
            </h2>
            <p className="text-muted-foreground mb-6">SSS Ryder Weekend 2026</p>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-black" style={{ color: '#DC2626' }}>{pimentonasGolf}</p>
                <p className="text-sm font-medium">Pimentonas</p>
              </div>
              <span className="text-2xl text-slate-300">-</span>
              <div className="text-center">
                <p className="text-4xl font-black" style={{ color: '#2563EB' }}>{tabaquerasGolf}</p>
                <p className="text-sm font-medium">Tabaqueras</p>
              </div>
            </div>

            <Link href="/trophies" className="inline-block mt-6">
              <Badge className="bg-amber-500 text-white px-4 py-2 text-sm">
                Ver Trofeos
              </Badge>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ===================== */}
      {/* LISTA DE RONDAS - Siempre visible */}
      {/* ===================== */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground px-1 uppercase tracking-wider">Rondas</h3>
        {rounds.map((round) => {
          const roundMatches = matches.filter(m => m.round_id === round.id);
          const completed = roundMatches.filter(m => m.status === 'completed').length;
          const live = roundMatches.filter(m => m.status === 'in_progress').length;
          const clubKey = round.name.toLowerCase().includes('scramble') ? 'scramble' : 'singles';
          const clubInfo = CLUB_INFO[clubKey];
          const isCurrentRound = currentRound?.id === round.id && (phase === 'saturday' || phase === 'sunday');
          
          // Solo permitir click si el torneo ya ha comenzado
          const isClickable = phase !== 'before';

          const cardContent = (
            <Card className={`transition-colors ${isCurrentRound ? 'border-2 border-emerald-500 bg-emerald-50/50' : ''} ${isClickable ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={clubInfo.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{round.name}</h4>
                      {isCurrentRound && (
                        <Badge className="bg-emerald-600 text-white text-xs">AHORA</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{clubInfo.name}</p>
                  </div>

                  <div className="text-right">
                    {live > 0 ? (
                      <Badge variant="destructive" className="animate-pulse">
                        {live} LIVE
                      </Badge>
                    ) : round.is_completed ? (
                      <Badge className="bg-slate-600">Finalizada</Badge>
                    ) : !isClickable ? (
                      <Badge variant="outline" className="text-slate-500">Próximamente</Badge>
                    ) : (
                      <Badge variant="outline">{completed}/{roundMatches.length}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return isClickable ? (
            <Link key={round.id} href={`/rounds/${round.id}`}>
              {cardContent}
            </Link>
          ) : (
            <div key={round.id}>
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Info del torneo */}
      <Card className="bg-slate-100 border-slate-200">
        <CardContent className="py-3">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>31 Ene - 1 Feb 2026</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>La Vera, Extremadura</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
