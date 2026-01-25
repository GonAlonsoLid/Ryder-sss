import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageContainer({ children, className, noPadding }: PageContainerProps) {
  return (
    <main className={cn(
      'min-h-dvh pb-20 max-w-lg mx-auto',
      !noPadding && 'px-4 py-4',
      className
    )}>
      {children}
    </main>
  );
}

