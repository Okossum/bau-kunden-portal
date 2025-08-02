import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// User data interface for the construction portal
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'customer' | 'employee';
  tenantId?: string; // For multi-tenant support
  projects?: string[]; // Array of project IDs the user has access to
  createdAt: Date;
  lastLoginAt: Date;
  twoFactorEnabled: boolean;
  twoFactorCompleted: boolean;
}

// User service class for handling user-related operations
export class UserService {
  /**
   * Get user data from Firebase Auth user
   * In a real application, this would fetch additional user data from Firestore
   */
  static async getUserData(user: User): Promise<UserData> {
    try {
      // Try to fetch user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: user.uid,
          email: user.email || '',
          displayName: userData.displayName || user.displayName || undefined,
          role: userData.role || 'customer', // Use role from Firestore
          tenantId: userData.tenantId || undefined,
          projects: userData.projects || [],
          createdAt: userData.createdAt?.toDate() || new Date(user.metadata.creationTime || Date.now()),
          lastLoginAt: userData.lastLoginAt?.toDate() || new Date(user.metadata.lastSignInTime || Date.now()),
          twoFactorEnabled: userData.twoFactorEnabled || false,
          twoFactorCompleted: userData.twoFactorCompleted !== false // Default to true if not set
        };
      }
      
      // If no Firestore document exists, return basic user data
      console.log(`No Firestore document found for user ${user.uid}, using default data`);
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        role: 'customer', // Default role for new users
        tenantId: undefined,
        projects: [],
        createdAt: new Date(user.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(user.metadata.lastSignInTime || Date.now()),
        twoFactorEnabled: false,
        twoFactorCompleted: true
      };
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      // Fallback to basic user data if Firestore query fails
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        role: 'customer', // Default role
        tenantId: undefined,
        projects: [],
        createdAt: new Date(user.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(user.metadata.lastSignInTime || Date.now()),
        twoFactorEnabled: false,
        twoFactorCompleted: true
      };
    }
  }

  /**
   * Get projects for a specific user
   * This would filter projects based on user permissions
   */
  static async getUserProjects(userId: string): Promise<any[]> {
    // In a real application, this would query Firestore
    // and filter projects based on user permissions
    console.log(`Fetching projects for user: ${userId}`);
    
    // Mock data for demonstration
    return [
      {
        id: 'project-1',
        name: 'Einfamilienhaus Musterstraße',
        status: 'in-progress',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
        progress: 65
      },
      {
        id: 'project-2',
        name: 'Bürogebäude Hauptstraße',
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        progress: 15
      },
      {
        id: 'project-3',
        name: 'Wohnanlage Gartenweg',
        status: 'completed',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-01-15'),
        progress: 100
      }
    ];
  }

  /**
   * Check if user has access to a specific project
   */
  static async hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
    // In a real application, this would check user permissions in the database
    const userProjects = await this.getUserProjects(userId);
    return userProjects.some(project => project.id === projectId);
  }

  /**
   * Get user role and permissions
   */
  static async getUserRole(userId: string): Promise<'admin' | 'customer' | 'employee'> {
    try {
      // Fetch user role from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || 'customer';
      }
      
      // Default role if no document exists
      return 'customer';
    } catch (error) {
      console.error('Error fetching user role from Firestore:', error);
      return 'customer';
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    // In a real application, this would update the user's last login in Firestore
    console.log(`Updating last login for user: ${userId}`);
  }
} 