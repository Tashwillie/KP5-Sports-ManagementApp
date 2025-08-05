'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { User, UserRole } from '../../../../shared/src/types';
import { AuthContextType } from '../../../../shared/src/utils/firebase';
import { getAuthErrorMessage } from '../../../../shared/src/utils/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Firebase is properly initialized
  const isFirebaseAvailable = auth && db && typeof auth.onAuthStateChanged === 'function';

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!isFirebaseAvailable) {
      console.warn('Firebase not available, using mock authentication');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || userData.displayName || '',
              photoURL: firebaseUser.photoURL || userData.photoURL || '',
              phoneNumber: firebaseUser.phoneNumber || userData.phoneNumber || '',
              role: userData.role || 'player',
              clubId: userData.clubId || '',
              teamIds: userData.teamIds || [],
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              isActive: userData.isActive ?? true,
              preferences: userData.preferences || {
                notifications: { email: true, push: true, sms: false },
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            });
          } else {
            // Create user profile if it doesn't exist
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              phoneNumber: firebaseUser.phoneNumber || '',
              role: 'player',
              clubId: '',
              teamIds: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
              preferences: {
                notifications: { email: true, push: true, sms: false },
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            setUser(newUser);
          }
          setError(null);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load user profile');
        }
      } else {
        setUser(null);
        setError(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isFirebaseAvailable]);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication not available');
    }

    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication not available');
    }

    try {
      setError(null);
      setLoading(true);
      
      const { user: newFirebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await firebaseUpdateProfile(newFirebaseUser, { displayName });
      
      // Create user profile in Firestore
      const newUser: User = {
        id: newFirebaseUser.uid,
        email,
        displayName,
        photoURL: newFirebaseUser.photoURL || '',
        phoneNumber: newFirebaseUser.phoneNumber || '',
        role: 'player',
        clubId: '',
        teamIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        preferences: {
          notifications: { email: true, push: true, sms: false },
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await setDoc(doc(db, 'users', newFirebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication not available');
    }

    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication not available');
    }

    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // User profile will be created/updated in the auth state listener
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);
      // Phone auth implementation would go here
      // For now, throw an error
      throw new Error('Phone authentication not implemented yet');
    } catch (error: any) {
      const errorMessage = error.message || 'Phone sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (verificationId: string, code: string) => {
    try {
      setError(null);
      // OTP verification implementation would go here
      throw new Error('OTP verification not implemented yet');
    } catch (error: any) {
      const errorMessage = error.message || 'OTP verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication not available');
    }

    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!firebaseUser || !isFirebaseAvailable) {
      throw new Error('No user logged in or Firebase not available');
    }

    try {
      setError(null);
      
      // Update Firestore user profile
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      if (user) {
        setUser({ ...user, ...updates });
      }
      
      // Update Firebase Auth profile if displayName or photoURL changed
      if (updates.displayName || updates.photoURL) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: updates.displayName || firebaseUser.displayName,
          photoURL: updates.photoURL || firebaseUser.photoURL,
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await firebaseUser.reload();
    }
  };

  const value: AuthContextType = {
    user,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 