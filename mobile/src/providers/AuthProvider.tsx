import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, onAuthStateChanged, User as FirebaseUser, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { auth, getAPI } from '../lib/firebase';
import { User } from '../../../../../shared/src/types';
import { getAuthErrorMessage } from '../../../../../shared/src/utils/firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<string>;
  verifyOTP: (verificationId: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Use shared API to fetch user profile
          const api = getAPI();
          const userProfile = await api.users.getUser(firebaseUser.uid);
          setUser(userProfile);
          setError(null);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If profile doesn't exist, create one
          if (firebaseUser.email) {
            try {
              const api = getAPI();
              await api.users.createUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                phoneNumber: firebaseUser.phoneNumber || '',
                role: 'player',
                teamIds: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                preferences: {
                  notifications: { email: true, push: true, sms: false },
                  language: 'en',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
              });
              
              const newProfile = await api.users.getUser(firebaseUser.uid);
              setUser(newProfile);
              setError(null);
            } catch (createError) {
              console.error('Error creating user profile:', createError);
              setError('Failed to create user profile');
            }
          }
        }
      } else {
        setUser(null);
        setError(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const api = getAPI();
      await api.auth.signIn(email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const api = getAPI();
      const newFirebaseUser = await api.auth.signUp(email, password, displayName);
      
      // Create user document using shared API
      await api.users.createUser({
        id: newFirebaseUser.uid,
        email: newFirebaseUser.email!,
        displayName: displayName,
        role: 'player',
        teamIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        preferences: {
          notifications: { email: true, push: true, sms: false },
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const api = getAPI();
      await api.auth.signOut();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // TODO: Implement Google sign-in
      console.log('Google sign in not implemented yet');
      throw new Error('Google sign in not implemented yet');
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);
      // Phone auth implementation
      console.log('Phone sign in not implemented yet');
      throw new Error('Phone sign in not implemented yet');
    } catch (error: any) {
      const errorMessage = error.message || 'Phone sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (verificationId: string, code: string) => {
    try {
      setError(null);
      // OTP verification implementation
      console.log('OTP verification not implemented yet');
      throw new Error('OTP verification not implemented yet');
    } catch (error: any) {
      const errorMessage = error.message || 'OTP verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const api = getAPI();
      await api.auth.resetPassword(email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!firebaseUser) {
      throw new Error('No user logged in');
    }

    try {
      setError(null);
      const api = getAPI();
      await api.users.updateUser(firebaseUser.uid, updates);
      
      // Update local state
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const api = getAPI();
        const userProfile = await api.users.getUser(firebaseUser.uid);
        setUser(userProfile);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithPhone,
      verifyOTP,
      resetPassword,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 