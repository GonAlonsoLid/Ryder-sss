import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { HidalgoMorningProvider } from '@/components/features/hidalgo-morning-provider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HidalgoMorningProvider>
      <Header />
      {children}
      <BottomNav />
    </HidalgoMorningProvider>
  );
}

