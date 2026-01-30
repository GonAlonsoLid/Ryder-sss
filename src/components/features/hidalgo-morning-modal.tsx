'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DRINK_EMOJIS } from '@/lib/constants';

interface HidalgoMorningModalProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  onClose: () => void;
  loading: boolean;
}

export function HidalgoMorningModal({
  open,
  onYes,
  onNo,
  onClose,
  loading,
}: HidalgoMorningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>{DRINK_EMOJIS.hidalgo ?? '🫗'}</span>
            Buenos días
          </DialogTitle>
          <DialogDescription>
            ¿Te hiciste un hidalgo anoche? Si dices que sí, tendrás que conseguir que te validen una persona de tu equipo y otra del equipo contrario. Si no está validado a tiempo, tu equipo pierde 1 punto.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onNo}
            disabled={loading}
            className="flex-1"
          >
            No
          </Button>
          <Button
            onClick={onYes}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Sí'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
