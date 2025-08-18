// Enhanced Authentication Context Provider
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedAuth } from '@/hooks/enhancedUseAuth';
import { AuthContextType } from '@shared/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const EnhancedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useEnhancedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useEnhancedAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useEnhancedAuthContext must be used within an EnhancedAuthProvider');
  }
  
  return context;
};

// Export the hook directly for convenience
export { useEnhancedAuth };
