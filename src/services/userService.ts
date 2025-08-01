import { User } from 'firebase/auth';

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
}

// User service class for handling user-related operations
export class UserService {
  /**
   * Get user data from Firebase Auth user
   * In a real application, this would fetch additional user data from Firestore
   */
  static async getUserData(user: User): Promise<UserData> {
    // For now, return basic user data
    // In a real app, you would fetch additional data from Firestore
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      role: 'customer', // Default role, should be fetched from database
      tenantId: undefined, // Should be fetched from database
      projects: [], // Should be fetched from database
      createdAt: new Date(user.metadata.creationTime || Date.now()),
      lastLoginAt: new Date(user.metadata.lastSignInTime || Date.now())
    };
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
    // In a real application, this would fetch user role from database
    // For now, return default role
    return 'customer';
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    // In a real application, this would update the user's last login in Firestore
    console.log(`Updating last login for user: ${userId}`);
  }
} 