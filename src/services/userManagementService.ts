import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  deleteUser as deleteAuthUser,
  updatePassword,
  signOut,
  signInWithEmailAndPassword,
  getAuth
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

// Interface for the user management system
export interface UserManagementUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  role: 'Admin' | 'Kunde' | 'Employee' | 'Partner';
  status: 'Aktiv' | 'Inaktiv';
  // Adressdaten
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  // Kontaktdaten
  phoneLandline?: string;
  phoneMobile?: string;
  // Systemdaten
  lastLogin: string;
  projects?: string[];
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service class for user management operations
export class UserManagementService {
  private static readonly COLLECTION_NAME = 'users';

  /**
   * Get all users from Firestore
   */
  static async getAllUsers(): Promise<UserManagementUser[]> {
    try {
      console.log('Attempting to fetch users from Firestore...');
      const usersRef = collection(db, this.COLLECTION_NAME);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('Firestore query successful, found documents:', querySnapshot.size);
      
      const users: UserManagementUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);
        const user = {
          id: doc.id,
          firstName: data.firstName || data.displayName?.split(' ')[0] || '',
          lastName: data.lastName || data.displayName?.split(' ').slice(1).join(' ') || '',
          email: data.email || '',
          company: data.company || data.companyName || '',
          role: data.role === 'admin' ? 'Admin' : data.role === 'employee' ? 'Employee' : data.role === 'partner' ? 'Partner' : 'Kunde',
          status: data.status || (data.isActive ? 'Aktiv' : 'Inaktiv'),
          street: data.street || '',
          houseNumber: data.houseNumber || '',
          postalCode: data.postalCode || '',
          city: data.city || '',
          phoneLandline: data.phoneLandline || '',
          phoneMobile: data.phoneMobile || '',
          lastLogin: data.lastLogin || data.lastLoginAt || new Date().toISOString(),
          projects: data.projects || [],
          tenantId: data.tenantId || 'default-tenant',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        console.log('Processing user document:', doc.id, data);
        console.log('Converted user:', user);
        users.push(user);
      });
      
      console.log('Processed users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array for now to avoid breaking the UI
      console.log('Returning empty array due to error');
      return [];
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId: string): Promise<UserManagementUser | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          role: data.role || 'Kunde',
          status: data.status || 'Aktiv',
          lastLogin: data.lastLogin || new Date().toISOString(),
          projects: data.projects || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Fehler beim Laden des Benutzers');
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: Partial<UserManagementUser>): Promise<UserManagementUser> {
    try {
      // Check if admin is logged in
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Kein Admin-Benutzer angemeldet');
      }
      
      console.log('Current admin user:', currentUser.email);
      
      // Create the Firestore document first (without Firebase Auth user)
      const userDoc = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        companyName: userData.company || '',
        role: userData.role === 'Admin' ? 'admin' : userData.role === 'Employee' ? 'employee' : userData.role === 'Partner' ? 'partner' : 'customer',
        isActive: userData.status === 'Aktiv',
        street: userData.street || '',
        houseNumber: userData.houseNumber || '',
        postalCode: userData.postalCode || '',
        city: userData.city || '',
        phoneLandline: userData.phoneLandline || '',
        phoneMobile: userData.phoneMobile || '',
        lastLoginAt: serverTimestamp(),
        projects: userData.projects || [],
        tenantId: userData.tenantId || 'default-tenant',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        authUid: null, // Will be set when user completes registration
        registrationPending: true, // Flag to indicate user needs to complete registration
        registrationToken: this.generateRegistrationToken() // Generate unique token for registration link
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), userDoc);
      
      // TODO: Send registration email with link
      // This will be implemented later with Firebase Functions or email service
      console.log('User created successfully. Registration email should be sent to:', userData.email);
      
      return {
        id: docRef.id,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        company: userDoc.companyName,
        role: userDoc.role === 'admin' ? 'Admin' : userDoc.role === 'employee' ? 'Employee' : userDoc.role === 'partner' ? 'Partner' : 'Kunde',
        status: userDoc.isActive ? 'Aktiv' : 'Inaktiv',
        street: userDoc.street,
        houseNumber: userDoc.houseNumber,
        postalCode: userDoc.postalCode,
        city: userDoc.city,
        phoneLandline: userDoc.phoneLandline,
        phoneMobile: userDoc.phoneMobile,
        lastLogin: new Date().toISOString(),
        projects: userDoc.projects,
        tenantId: userDoc.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.message?.includes('email-already-in-use')) {
        throw new Error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits');
      } else if (error.message?.includes('invalid-email')) {
        throw new Error('Ungültige E-Mail-Adresse');
      } else {
        throw new Error(`Fehler beim Erstellen des Benutzers: ${error.message}`);
      }
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(userId: string, userData: Partial<UserManagementUser> & { password?: string }): Promise<UserManagementUser> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Benutzer nicht gefunden');
      }

      const data = userDoc.data();
      
      // Update Firestore document
      const updateData: any = {
        firstName: userData.firstName !== undefined ? userData.firstName : data.firstName,
        lastName: userData.lastName !== undefined ? userData.lastName : data.lastName,
        displayName: `${userData.firstName || data.firstName} ${userData.lastName || data.lastName}`,
        email: userData.email || data.email,
        companyName: userData.company !== undefined ? userData.company : (data.companyName || data.company),
        role: userData.role === 'Admin' ? 'admin' : userData.role === 'Employee' ? 'employee' : userData.role === 'Partner' ? 'partner' : userData.role === 'Kunde' ? 'customer' : data.role,
        isActive: userData.status === 'Aktiv' ? true : userData.status === 'Inaktiv' ? false : data.isActive,
        street: userData.street !== undefined ? userData.street : data.street,
        houseNumber: userData.houseNumber !== undefined ? userData.houseNumber : data.houseNumber,
        postalCode: userData.postalCode !== undefined ? userData.postalCode : data.postalCode,
        city: userData.city !== undefined ? userData.city : data.city,
        phoneLandline: userData.phoneLandline !== undefined ? userData.phoneLandline : data.phoneLandline,
        phoneMobile: userData.phoneMobile !== undefined ? userData.phoneMobile : data.phoneMobile,
        projects: userData.projects || data.projects,
        tenantId: userData.tenantId || data.tenantId,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);

      // Update password if provided
      if (userData.password && data.authUid) {
        // Note: This requires the user to be signed in or admin privileges
        // In a real app, you might want to use admin SDK or send password reset email
        console.log('Password update would require admin SDK or password reset email');
      }

      return {
        id: userId,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        company: updateData.companyName,
        role: updateData.role === 'admin' ? 'Admin' : updateData.role === 'employee' ? 'Employee' : updateData.role === 'partner' ? 'Partner' : 'Kunde',
        status: updateData.isActive ? 'Aktiv' : 'Inaktiv',
        street: updateData.street,
        houseNumber: updateData.houseNumber,
        postalCode: updateData.postalCode,
        city: updateData.city,
        phoneLandline: updateData.phoneLandline,
        phoneMobile: updateData.phoneMobile,
        lastLogin: data.lastLoginAt?.toDate()?.toISOString() || data.lastLogin || new Date().toISOString(),
        projects: updateData.projects,
        tenantId: updateData.tenantId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Fehler beim Aktualisieren des Benutzers');
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Benutzer nicht gefunden');
      }

      const data = userDoc.data();
      
      // Delete Firestore document
      await deleteDoc(userRef);
      
      // Note: Deleting Firebase Auth user requires admin SDK
      // In a real app, you might want to use admin SDK or just disable the account
      console.log('Firebase Auth user deletion would require admin SDK');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Fehler beim Löschen des Benutzers');
    }
  }

  /**
   * Toggle user status
   */
  static async toggleUserStatus(userId: string): Promise<UserManagementUser> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Benutzer nicht gefunden');
      }

      const data = userDoc.data();
      const currentStatus = data.isActive ? 'Aktiv' : 'Inaktiv';
      const newStatus = currentStatus === 'Aktiv' ? 'Inaktiv' : 'Aktiv';
      
      await updateDoc(userRef, {
        isActive: newStatus === 'Aktiv',
        updatedAt: serverTimestamp()
      });

      return {
        id: userId,
        firstName: data.firstName || data.displayName?.split(' ')[0] || '',
        lastName: data.lastName || data.displayName?.split(' ').slice(1).join(' ') || '',
        email: data.email,
        company: data.companyName || data.company || '',
        role: data.role === 'admin' ? 'Admin' : data.role === 'employee' ? 'Employee' : data.role === 'partner' ? 'Partner' : 'Kunde',
        status: newStatus,
        street: data.street || '',
        houseNumber: data.houseNumber || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        phoneLandline: data.phoneLandline || '',
        phoneMobile: data.phoneMobile || '',
        lastLogin: data.lastLoginAt?.toDate()?.toISOString() || data.lastLogin || new Date().toISOString(),
        projects: data.projects || [],
        tenantId: data.tenantId || 'default-tenant',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Fehler beim Ändern des Benutzerstatus');
    }
  }

  /**
   * Reset user password (sends reset email)
   */
  static async resetUserPassword(email: string): Promise<void> {
    try {
      // In a real app, you would use Firebase Auth sendPasswordResetEmail
      // For now, we'll just log it
      console.log(`Password reset email would be sent to: ${email}`);
      
      // Example implementation:
      // import { sendPasswordResetEmail } from 'firebase/auth';
      // await sendPasswordResetEmail(auth, email);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Fehler beim Zurücksetzen des Passworts');
    }
  }

  /**
   * Generate a unique registration token
   */
  private static generateRegistrationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Create test data for development purposes
   * Creates 20 test users: 5 employees, 5 partners, 5 private customers, 5 business customers
   */
  static async createTestData(): Promise<void> {
    try {
      console.log('🚀 Starting test data creation...');
      
      const testUsers = [
        // 5 Employees
        {
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@test.de',
          company: 'Mathi Hoffer GmbH',
          role: 'Employee' as const,
          status: 'Aktiv' as const,
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-123456',
          phoneMobile: '0170-1234567'
        },
        {
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@test.de',
          company: 'Mathi Hoffer GmbH',
          role: 'Employee' as const,
          status: 'Aktiv' as const,
          street: 'Beispielweg',
          houseNumber: '15',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-234567',
          phoneMobile: '0170-2345678'
        },
        {
          firstName: 'Thomas',
          lastName: 'Weber',
          email: 'thomas.weber@test.de',
          company: 'Mathi Hoffer GmbH',
          role: 'Employee' as const,
          status: 'Aktiv' as const,
          street: 'Testallee',
          houseNumber: '42',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-345678',
          phoneMobile: '0170-3456789'
        },
        {
          firstName: 'Lisa',
          lastName: 'Müller',
          email: 'lisa.mueller@test.de',
          company: 'Mathi Hoffer GmbH',
          role: 'Employee' as const,
          status: 'Aktiv' as const,
          street: 'Datenstraße',
          houseNumber: '7',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-456789',
          phoneMobile: '0170-4567890'
        },
        {
          firstName: 'Michael',
          lastName: 'Fischer',
          email: 'michael.fischer@test.de',
          company: 'Mathi Hoffer GmbH',
          role: 'Employee' as const,
          status: 'Aktiv' as const,
          street: 'Entwicklungsweg',
          houseNumber: '23',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-567890',
          phoneMobile: '0170-5678901'
        },
        
        // 5 Partners
        {
          firstName: 'Hans',
          lastName: 'Bauer',
          email: 'hans.bauer@partner1.de',
          company: 'Bauer & Partner GmbH',
          role: 'Partner' as const,
          status: 'Aktiv' as const,
          street: 'Partnerstraße',
          houseNumber: '100',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-111111',
          phoneMobile: '0170-1111111'
        },
        {
          firstName: 'Maria',
          lastName: 'Klein',
          email: 'maria.klein@partner2.de',
          company: 'Klein Consulting',
          role: 'Partner' as const,
          status: 'Aktiv' as const,
          street: 'Beratungsweg',
          houseNumber: '200',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-222222',
          phoneMobile: '0170-2222222'
        },
        {
          firstName: 'Peter',
          lastName: 'Schwarz',
          email: 'peter.schwarz@partner3.de',
          company: 'Schwarz Architekten',
          role: 'Partner' as const,
          status: 'Aktiv' as const,
          street: 'Architektenplatz',
          houseNumber: '300',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-333333',
          phoneMobile: '0170-3333333'
        },
        {
          firstName: 'Sabine',
          lastName: 'Krause',
          email: 'sabine.krause@partner4.de',
          company: 'Krause Engineering',
          role: 'Partner' as const,
          status: 'Aktiv' as const,
          street: 'Ingenieurstraße',
          houseNumber: '400',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-444444',
          phoneMobile: '0170-4444444'
        },
        {
          firstName: 'Klaus',
          lastName: 'Werner',
          email: 'klaus.werner@partner5.de',
          company: 'Werner Solutions',
          role: 'Partner' as const,
          status: 'Aktiv' as const,
          street: 'Lösungsweg',
          houseNumber: '500',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-555555',
          phoneMobile: '0170-5555555'
        },
        
        // 5 Private Customers
        {
          firstName: 'Erika',
          lastName: 'Meyer',
          email: 'erika.meyer@privat.de',
          company: '',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Privatstraße',
          houseNumber: '10',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-666666',
          phoneMobile: '0170-6666666'
        },
        {
          firstName: 'Wolfgang',
          lastName: 'Schulz',
          email: 'wolfgang.schulz@privat.de',
          company: '',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Hausweg',
          houseNumber: '20',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-777777',
          phoneMobile: '0170-7777777'
        },
        {
          firstName: 'Gertrud',
          lastName: 'Hoffmann',
          email: 'gertrud.hoffmann@privat.de',
          company: '',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Wohnstraße',
          houseNumber: '30',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-888888',
          phoneMobile: '0170-8888888'
        },
        {
          firstName: 'Dieter',
          lastName: 'Koch',
          email: 'dieter.koch@privat.de',
          company: '',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Familienweg',
          houseNumber: '40',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-999999',
          phoneMobile: '0170-9999999'
        },
        {
          firstName: 'Helga',
          lastName: 'Richter',
          email: 'helga.richter@privat.de',
          company: '',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Privatplatz',
          houseNumber: '50',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-000000',
          phoneMobile: '0170-0000000'
        },
        
        // 5 Business Customers
        {
          firstName: 'Dr. Franz',
          lastName: 'Wagner',
          email: 'franz.wagner@firma1.de',
          company: 'Wagner & Co. GmbH',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Geschäftsstraße',
          houseNumber: '1000',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-1111111',
          phoneMobile: '0170-11111111'
        },
        {
          firstName: 'Dr. Petra',
          lastName: 'Becker',
          email: 'petra.becker@firma2.de',
          company: 'Becker Industries AG',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Industrieweg',
          houseNumber: '2000',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-2222222',
          phoneMobile: '0170-22222222'
        },
        {
          firstName: 'Prof. Dr. Karl',
          lastName: 'Hoffmann',
          email: 'karl.hoffmann@firma3.de',
          company: 'Hoffmann Technologies',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Technologiepark',
          houseNumber: '3000',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-3333333',
          phoneMobile: '0170-33333333'
        },
        {
          firstName: 'Dr. Ing. Monika',
          lastName: 'Schäfer',
          email: 'monika.schaefer@firma4.de',
          company: 'Schäfer Systems',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Systemstraße',
          houseNumber: '4000',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-4444444',
          phoneMobile: '0170-44444444'
        },
        {
          firstName: 'Dipl.-Ing. Stefan',
          lastName: 'Meyer',
          email: 'stefan.meyer@firma5.de',
          company: 'Meyer Solutions GmbH',
          role: 'Kunde' as const,
          status: 'Aktiv' as const,
          street: 'Lösungsstraße',
          houseNumber: '5000',
          postalCode: '80331',
          city: 'München',
          phoneLandline: '089-5555555',
          phoneMobile: '0170-55555555'
        }
      ];

      let createdCount = 0;
      
      for (const userData of testUsers) {
        try {
          const userDoc = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            displayName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            companyName: userData.company,
            role: userData.role === 'Admin' ? 'admin' : userData.role === 'Employee' ? 'employee' : userData.role === 'Partner' ? 'partner' : 'customer',
            isActive: userData.status === 'Aktiv',
            street: userData.street,
            houseNumber: userData.houseNumber,
            postalCode: userData.postalCode,
            city: userData.city,
            phoneLandline: userData.phoneLandline,
            phoneMobile: userData.phoneMobile,
            lastLoginAt: serverTimestamp(),
            projects: [],
            tenantId: 'default-tenant',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            authUid: null,
            registrationPending: true,
            registrationToken: this.generateRegistrationToken()
          };

          await addDoc(collection(db, this.COLLECTION_NAME), userDoc);
          createdCount++;
          console.log(`✅ Created test user ${createdCount}/20: ${userData.firstName} ${userData.lastName} (${userData.role})`);
        } catch (error) {
          console.error(`❌ Failed to create test user ${userData.firstName} ${userData.lastName}:`, error);
        }
      }
      
      console.log(`🎉 Test data creation completed! Created ${createdCount}/20 users.`);
      
    } catch (error) {
      console.error('❌ Error creating test data:', error);
      throw new Error('Fehler beim Erstellen der Testdaten');
    }
  }
}