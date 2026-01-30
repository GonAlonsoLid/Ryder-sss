'use client';

import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useHidalgoCheckin } from '@/hooks/use-hidalgo-checkin';
import { HidalgoMorningModal } from './hidalgo-morning-modal';

export function HidalgoMorningProvider({ children }: { children: React.ReactNode }) {
  const { player } = useSimpleAuth();
  const { showPrompt, submitting, submit } = useHidalgoCheckin(player?.id);

  return (
    <>
      {children}
      <HidalgoMorningModal
        open={showPrompt}
        onYes={() => submit(true)}
        onNo={() => submit(false)}
        loading={submitting}
      />
    </>
  );
}
