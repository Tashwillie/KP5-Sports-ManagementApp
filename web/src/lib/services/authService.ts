import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  PhoneAuthProvider,
  RecaptchaVerifier,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserRole } from '../../../../shared/src/types';
import { getAuthErrorMessage } from '../../../../shared/src/utils/firebase';

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();
  private static phoneProvider = new PhoneAuthProvider(auth);

  // Email/Password Authentication
  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await this.getUserProfile(userCredential.user.uid);
      
      if (!userData) {
        throw new Error('User profile not found');
      }

      return userData;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async signUpWithEmail(
    email: string, 
    password: string, 
    displayName: string,
    role: UserRole = 'player'
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await firebaseUpdateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      const userProfile: User = {
        id: userCredential.user.uid,
        email,
        displayName,
        photoURL: userCredential.user.photoURL || '',
        phoneNumber: userCredential.user.phoneNumber || '',
        role,
        clubId: '',
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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userProfile;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Google Authentication
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const userData = await this.getUserProfile(result.user.uid);
      
      if (!userData) {
        // Create user profile if it doesn't exist
        return await this.createUserProfileFromGoogle(result.user);
      }

      return userData;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async signInWithGoogleRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, this.googleProvider);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async getGoogleRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const userData = await this.getUserProfile(result.user.uid);
        if (!userData) {
          return await this.createUserProfileFromGoogle(result.user);
        }
        return userData;
      }
      return null;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Phone Authentication
  static async signInWithPhone(phoneNumber: string): Promise<string> {
    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const confirmationResult = await this.phoneProvider.verifyPhoneNumber(
        phoneNumber,
        appVerifier
      );

      return confirmationResult;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async verifyPhoneOTP(verificationId: string, code: string): Promise<User> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithPopup(auth, this.phoneProvider);
      const userData = await this.getUserProfile(userCredential.user.uid);
      
      if (!userData) {
        return await this.createUserProfileFromPhone(userCredential.user);
      }

      return userData;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Password Reset
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Sign Out
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // Profile Management
  static async updateProfile(updates: Partial<User>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update Firebase Auth profile
      const authUpdates: any = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;

      if (Object.keys(authUpdates).length > 0) {
        await firebaseUpdateProfile(auth.currentUser, authUpdates);
      }

      // Update Firestore profile
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async updateEmail(newEmail: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await updateEmail(auth.currentUser, newEmail);
      
      // Update Firestore profile
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        email: newEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async updatePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  static async deleteAccount(password: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Re-authenticate before deleting
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user
      await deleteUser(auth.currentUser);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  // User Profile Management
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private static async createUserProfileFromGoogle(firebaseUser: any): Promise<User> {
    const userProfile: User = {
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
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userProfile;
  }

  private static async createUserProfileFromPhone(firebaseUser: any): Promise<User> {
    const userProfile: User = {
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
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userProfile;
  }

  // Utility methods
  static getCurrentUser() {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  }
} 