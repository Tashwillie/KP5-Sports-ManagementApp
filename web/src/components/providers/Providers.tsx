'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
} 