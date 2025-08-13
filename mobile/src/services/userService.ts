import { User, UserRole } from '@kp5-academy/shared';

export class UserService {
  private static collection = firestore().collection('users');

  // Create a new user profile
  static async createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userProfile: User = {
        id: userId,
        email: userData.email || '',
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        phoneNumber: userData.phoneNumber || '',
        role: userData.role || 'player',
        clubId: userData.clubId || '',
        teamIds: userData.teamIds || [],
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

      await this.collection.doc(userId).set(userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const doc = await this.collection.doc(userId).get();
      if (doc.exists) {
        return doc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.collection.doc(userId).update(updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Update user role
  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        role,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  // Get users by role
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const snapshot = await this.collection
        .where('role', '==', role)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as User);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }

  // Get users by club
  static async getUsersByClub(clubId: string): Promise<User[]> {
    try {
      const snapshot = await this.collection
        .where('clubId', '==', clubId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as User);
    } catch (error) {
      console.error('Error fetching users by club:', error);
      throw new Error('Failed to fetch users by club');
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const snapshot = await this.collection
        .where('isActive', '==', true)
        .get();

      const users = snapshot.docs.map((doc: any) => doc.data() as User);
      
      return users.filter((user: User) => 
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        isActive: false,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  // Reactivate user
  static async reactivateUser(userId: string): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        isActive: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw new Error('Failed to reactivate user');
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: Partial<User['preferences']>): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        'preferences': preferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  // Add user to team
  static async addUserToTeam(userId: string, teamId: string): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        teamIds: firestore.FieldValue.arrayUnion(teamId),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error adding user to team:', error);
      throw new Error('Failed to add user to team');
    }
  }

  // Remove user from team
  static async removeUserFromTeam(userId: string, teamId: string): Promise<void> {
    try {
      await this.collection.doc(userId).update({
        teamIds: firestore.FieldValue.arrayRemove(teamId),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error removing user from team:', error);
      throw new Error('Failed to remove user from team');
    }
  }
} 