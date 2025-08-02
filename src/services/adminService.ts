import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export class AdminService {
  /**
   * Erstellt einen neuen Admin-User
   */
  static async createAdminUser(email: string, password: string, displayName?: string): Promise<AdminUser> {
    try {
      // 1. Firebase Auth User erstellen
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Admin-Daten in Firestore speichern
      const adminData: AdminUser = {
        uid: user.uid,
        email: user.email!,
        role: 'admin',
        displayName: displayName || 'Administrator',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      // 3. In Firestore speichern
      await setDoc(doc(db, 'users', user.uid), adminData);

      console.log('✅ Admin-User erfolgreich erstellt:', email);
      return adminData;

    } catch (error: any) {
      console.error('❌ Fehler beim Erstellen des Admin-Users:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ein User mit dieser E-Mail-Adresse existiert bereits.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Das Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Ungültige E-Mail-Adresse.');
      } else {
        throw new Error(`Fehler beim Erstellen des Admin-Users: ${error.message}`);
      }
    }
  }

  /**
   * Prüft ob ein User Admin-Rechte hat
   */
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Prüfen der Admin-Rechte:', error);
      return false;
    }
  }

  /**
   * Aktualisiert die Rolle eines Users
   */
  static async updateUserRole(uid: string, role: 'admin' | 'customer'): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), { role }, { merge: true });
      console.log(`✅ User-Rolle aktualisiert: ${uid} -> ${role}`);
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren der User-Rolle:', error);
      throw error;
    }
  }

  /**
   * Testet Admin-Login
   */
  static async testAdminLogin(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdminUser = await this.isAdmin(userCredential.user.uid);
      
      if (isAdminUser) {
        console.log('✅ Admin-Login erfolgreich');
        return true;
      } else {
        console.log('❌ User ist kein Admin');
        return false;
      }
    } catch (error) {
      console.error('❌ Admin-Login fehlgeschlagen:', error);
      return false;
    }
  }
} 