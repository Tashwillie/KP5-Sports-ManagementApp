'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as AppUser, UserRole } from '../../../shared/src/types';

interface FirebaseContextType {
  user: any | null;
  userData: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<AppUser>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canCreateMatch: () => boolean;
  canManageMatch: (matchCreatorId?: string) => boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

// Mock user data for development
const mockUserData: AppUser = {
  id: 'mock-user-id',
  email: 'admin@kp5academy.com',
  displayName: 'Admin User',
  photoURL: '',
  phoneNumber: '',
  role: 'super_admin',
  teamIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    language: 'en',
    timezone: 'UTC',
  },
};

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate Firebase auth state change
    setTimeout(() => {
      setUser({ uid: 'mock-user-id', email: 'admin@kp5academy.com' });
      setUserData(mockUserData);
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in
    setUser({ uid: 'mock-user-id', email });
    setUserData(mockUserData);
  };

  const signUp = async (email: string, password: string, userData: Partial<AppUser>) => {
    // Mock sign up
    const newUser: AppUser = {
      ...mockUserData,
      ...userData,
      id: 'mock-user-id',
      email,
    };
    setUser({ uid: 'mock-user-id', email });
    setUserData(newUser);
  };

  const logout = async () => {
    setUser(null);
    setUserData(null);
  };

  const updateUserProfile = async (data: Partial<AppUser>) => {
    if (userData) {
      const updatedUser = { ...userData, ...data, updatedAt: new Date() };
      setUserData(updatedUser);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userData) return false;
    
    // Mock permissions based on role
    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: ['*'], // All permissions
      club_admin: ['manage_club', 'manage_teams', 'view_analytics', 'create_match', 'manage_match'],
      coach: ['manage_team', 'view_analytics', 'create_match', 'manage_match'],
      referee: ['manage_match', 'view_analytics'],
      player: ['view_team', 'view_match'],
      parent: ['view_team', 'view_match'],
    };

    const userPermissions = rolePermissions[userData.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return userData?.role === role;
  };

  const canCreateMatch = (): boolean => {
    return hasPermission('create_match');
  };

  const canManageMatch = (matchCreatorId?: string): boolean => {
    return hasPermission('manage_match') || userData?.id === matchCreatorId;
  };

  const value: FirebaseContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    hasPermission,
    hasRole,
    canCreateMatch,
    canManageMatch,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}; 