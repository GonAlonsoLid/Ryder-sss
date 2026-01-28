import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageContainer({ children, className, noPadding }: PageContainerProps) {
  return (
    <main 
      className={cn(
        'min-h-dvh max-w-lg mx-auto',
        !noPadding && 'px-4 py-4',
        className
      )}
      style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
    >
      {children}
    </main>
  );
}

