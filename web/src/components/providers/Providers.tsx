'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
} 