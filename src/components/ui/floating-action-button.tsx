'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ onClick, icon, label, className }: FABProps) {
  return (
    <div className="fixed bottom-24 right-4 z-40 safe-area-bottom">
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-elevation-xl',
          'bg-primary hover:bg-primary/90',
          'transition-all hover:scale-110 active:scale-95',
          className
        )}
        aria-label={label || 'Acción rápida'}
      >
        {icon || <Plus className="w-6 h-6" />}
      </Button>
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

