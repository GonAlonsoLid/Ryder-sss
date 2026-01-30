'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TriangleAlert } from 'lucide-react';

interface HidalgoMorningModalProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  loading: boolean;
}

export function HidalgoMorningModal({
  open,
  onYes,
  onNo,
  loading,
}: HidalgoMorningModalProps) {
  const handleExitAsNo = () => {
    if (!loading) onNo();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="w-[calc(100%-1.5rem)] max-w-lg max-h-[85dvh] flex flex-col p-4 sm:p-6 gap-4 overflow-y-auto"
        onPointerDownOutside={(e) => { e.preventDefault(); handleExitAsNo(); }}
        onEscapeKeyDown={(e) => { e.preventDefault(); handleExitAsNo(); }}
        onInteractOutside={(e) => { e.preventDefault(); handleExitAsNo(); }}
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4 sm:gap-5 text-center min-h-0 flex-1">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <TriangleAlert className="w-9 h-9 sm:w-11 sm:h-11 text-amber-600" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-semibold leading-tight">¿Te hiciste un hidalgo anoche?</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Sí = validar. No o salir = −1 punto</p>
          </div>
        </div>
        <DialogFooter className="flex gap-3 shrink-0 pt-1">
          <Button
            variant="outline"
            size="lg"
            onClick={onNo}
            disabled={loading}
            className="flex-1 text-sm sm:text-base min-h-11"
          >
            No
          </Button>
          <Button
            size="lg"
            onClick={onYes}
            disabled={loading}
            className="flex-1 text-sm sm:text-base min-h-11"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sí'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
