// Authentication service using API calls instead of Firebase
// This service handles user authentication through the backend API

import { User, LoginCredentials, RegisterCredentials, AuthError } from '@shared/types/auth';

export class AuthService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, userData?: any): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName: userData?.displayName || '',
          role: userData?.role || 'player',
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Google sign in (placeholder for future implementation)
  static async signInWithGoogle(): Promise<User> {
    throw new Error('Google sign in not implemented yet');
  }

  // Phone sign in (placeholder for future implementation)
  static async signInWithPhone(phoneNumber: string): Promise<User> {
    throw new Error('Phone sign in not implemented yet');
  }
}

export default AuthService; 