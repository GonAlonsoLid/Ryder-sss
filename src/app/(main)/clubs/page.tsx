'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Flag, ExternalLink, ChevronRight, X, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Club {
  id: string;
  name: string;
  shortName: string;
  location: string;
  description: string;
  round: string;
  roundDay: string;
  format: string;
  par: number;
  holes: number;
  length: string;
  designer?: string;
  year?: number;
  phone?: string;
  website?: string;
  mapUrl: string;
  mapEmbed: string;
  images: string[];
  features: string[];
  color: string;
}

const clubs: Club[] = [
  {
    id: 'talayuela',
    name: 'Talayuela Golf Club',
    shortName: 'Talayuela',
    location: 'Talayuela, Cáceres',
    description: 'Campo de 18 hoyos situado en plena comarca de La Vera, con espectaculares vistas a la Sierra de Gredos. Diseño técnico que combina calles anchas con greens bien defendidos. Ideal para el formato Scramble del sábado.',
    round: 'R1: Scramble',
    roundDay: 'Sábado 31 Enero',
    format: 'Scramble (Mejor bola)',
    par: 72,
    holes: 18,
    length: '6.200m',
    designer: 'Manuel Piñero',
    year: 2008,
    phone: '+34 927 577 085',
    website: 'https://talayuelagolf.com',
    mapUrl: 'https://maps.google.com/?q=Talayuela+Golf+Club',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3041.5!2d-5.6!3d40.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3f0!2sTalayuela%20Golf!5e0!3m2!1ses!2ses!4v1234567890',
    images: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    ],
    features: ['Driving Range', 'Putting Green', 'Restaurante', 'Pro Shop', 'Buggies'],
    color: '#16a34a', // green-600
  },
  {
    id: 'valdecanas',
    name: 'Golf Isla de Valdecañas',
    shortName: 'Valdecañas',
    location: 'El Gordo, Cáceres',
    description: 'Espectacular campo de 18 hoyos en una isla privada rodeada por el embalse de Valdecañas. Diseñado por los hermanos Azurmendi, ofrece un recorrido único con agua en juego en casi todos los hoyos. Escenario perfecto para los Singles del domingo.',
    round: 'R2: Singles',
    roundDay: 'Domingo 1 Febrero',
    format: 'Singles 1v1 Matchplay',
    par: 72,
    holes: 18,
    length: '6.400m',
    designer: 'Hermanos Azurmendi',
    year: 2007,
    phone: '+34 927 549 434',
    website: 'https://isladevaldecanas.com/golf',
    mapUrl: 'https://maps.google.com/?q=Golf+Isla+de+Valdecanas',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d-5.5!3d39.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3f0!2sIsla%20de%20Valdeca%C3%B1as!5e0!3m2!1ses!2ses!4v1234567890',
    images: [
      'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
      'https://images.unsplash.com/photo-1600005082646-6d0b8a23f6c4?w=800&q=80',
    ],
    features: ['Spa & Resort', 'Lago', 'Restaurante', 'Pro Shop', 'Academia'],
    color: '#2563eb', // blue-600
  },
];

export default function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Los Campos
        </h1>
        <p className="text-muted-foreground">
          Donde se forjará la leyenda
        </p>
      </div>

      {/* Club Cards */}
      <div className="space-y-4">
        {clubs.map((club) => (
          <Card 
            key={club.id}
            className={cn(
              'overflow-hidden cursor-pointer transition-all hover:shadow-elevation-lg active:scale-[0.98]',
              'border-2 hover:border-primary/30'
            )}
            onClick={() => {
              setSelectedClub(club);
              setActiveImageIndex(0);
            }}
          >
            {/* Club Image Header */}
            <div className="relative h-40 overflow-hidden">
              <img 
                src={club.images[0]} 
                alt={club.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Round Badge */}
              <Badge 
                className="absolute top-3 left-3 text-white border-0"
                style={{ backgroundColor: club.color }}
              >
                {club.round}
              </Badge>
              
              {/* Club Name */}
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {club.name}
                </h2>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{club.location}</span>
                </div>
              </div>
            </div>

            {/* Club Info */}
            <CardContent className="p-4">
              {/* Round Info */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{club.roundDay}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flag className="w-4 h-4" />
                  <span>Par {club.par}</span>
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {club.description}
              </p>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {club.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Club Detail Modal */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header with Image */}
            <div className="relative h-52 flex-shrink-0">
              <img 
                src={selectedClub.images[activeImageIndex]} 
                alt={selectedClub.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedClub(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Dots */}
              {selectedClub.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {selectedClub.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(idx);
                      }}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Club Name */}
              <div className="absolute bottom-3 left-4 right-16">
                <Badge 
                  className="text-white border-0 mb-2"
                  style={{ backgroundColor: selectedClub.color }}
                >
                  {selectedClub.round}
                </Badge>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {selectedClub.name}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-lg font-bold" style={{ color: selectedClub.color }}>{selectedClub.holes}</p>
                  <p className="text-xs text-muted-foreground">Hoyos</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-lg font-bold" style={{ color: selectedClub.color }}>{selectedClub.par}</p>
                  <p className="text-xs text-muted-foreground">Par</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-lg font-bold" style={{ color: selectedClub.color }}>{selectedClub.length}</p>
                  <p className="text-xs text-muted-foreground">Longitud</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-lg font-bold" style={{ color: selectedClub.color }}>{selectedClub.year}</p>
                  <p className="text-xs text-muted-foreground">Año</p>
                </div>
              </div>

              {/* Round Info */}
              <div className="p-4 rounded-xl border-2" style={{ borderColor: `${selectedClub.color}30`, backgroundColor: `${selectedClub.color}08` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedClub.color}20` }}>
                    <Calendar className="w-6 h-6" style={{ color: selectedClub.color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedClub.roundDay}</p>
                    <p className="text-sm text-muted-foreground">{selectedClub.format}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Sobre el campo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedClub.description}
                </p>
                {selectedClub.designer && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Diseñador:</span> {selectedClub.designer}
                  </p>
                )}
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-2">Servicios</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedClub.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div>
                <h3 className="font-semibold mb-2">Ubicación</h3>
                <div className="rounded-xl overflow-hidden border h-40 bg-muted">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(selectedClub.name + ' ' + selectedClub.location)}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedClub.location}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-2">
                {selectedClub.phone && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`tel:${selectedClub.phone}`, '_blank')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </Button>
                )}
                {selectedClub.website && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(selectedClub.website, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Web
                  </Button>
                )}
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: selectedClub.color }}
                  onClick={() => window.open(selectedClub.mapUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Cómo llegar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

