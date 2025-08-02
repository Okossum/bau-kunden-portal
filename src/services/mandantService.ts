import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Mandant, 
  CreateMandantRequest, 
  UpdateMandantRequest, 
  MandantTyp 
} from '../settings/types';

export class MandantService {
  private mandantenCollection = 'mandanten';

  /**
   * Create a new mandant
   */
  async createMandant(data: CreateMandantRequest): Promise<Mandant> {
    try {
      const mandantId = this.generateUUID();
      const mandantData = {
        mandantId: mandantId,
        name: data.name,
        typ: data.typ,
        adresse: data.adresse || null,
        createdAt: Timestamp.now(),
        firmenDaten: data.firmenDaten || null,
        aktive: data.aktive !== undefined ? data.aktive : true
      };

      // Use setDoc with the mandantId as document ID to match Firestore rules
      const docRef = doc(db, this.mandantenCollection, mandantId);
      
      await setDoc(docRef, mandantData);
      
      const createdMandant: Mandant = {
        ...mandantData,
        createdAt: mandantData.createdAt.toDate(),
        adresse: mandantData.adresse || undefined,
        firmenDaten: mandantData.firmenDaten || undefined
      };


      return createdMandant;
    } catch (error) {
      console.error('MandantService: Error creating mandant:', error);
      throw new Error('Fehler beim Erstellen des Mandanten');
    }
  }

  /**
   * Get all mandanten
   */
  async getAllMandanten(): Promise<Mandant[]> {
    try {


      const q = query(
        collection(db, this.mandantenCollection),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const mandanten: Mandant[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        mandanten.push({
          mandantId: data.mandantId,
          name: data.name,
          typ: data.typ,
          adresse: data.adresse,
          createdAt: data.createdAt?.toDate() || new Date(),
          firmenDaten: data.firmenDaten,
          aktive: data.aktive !== undefined ? data.aktive : true
        });
      });


      return mandanten;
    } catch (error) {
      console.error('MandantService: Error fetching mandanten:', error);
      throw new Error('Fehler beim Laden der Mandanten');
    }
  }

  /**
   * Get active mandanten only (client-side filtering to avoid index issues)
   */
  async getActiveMandanten(): Promise<Mandant[]> {
    try {


      // Get all mandanten and filter client-side to avoid index issues
      const allMandanten = await this.getAllMandanten();
      const activeMandanten = allMandanten.filter(mandant => mandant.aktive !== false);


      return activeMandanten;
    } catch (error) {
      console.error('MandantService: Error fetching active mandanten:', error);
      throw new Error('Fehler beim Laden der aktiven Mandanten');
    }
  }

  /**
   * Get mandant by ID
   */
  async getMandantById(mandantId: string): Promise<Mandant | null> {
    try {
      console.log('MandantService: Fetching mandant by ID:', mandantId);

      const q = query(
        collection(db, this.mandantenCollection),
        where('mandantId', '==', mandantId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('MandantService: No mandant found with ID:', mandantId);
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const mandant: Mandant = {
        mandantId: data.mandantId,
        name: data.name,
        typ: data.typ,
        adresse: data.adresse,
        createdAt: data.createdAt?.toDate() || new Date(),
        firmenDaten: data.firmenDaten,
        aktive: data.aktive !== undefined ? data.aktive : true
      };

      console.log('MandantService: Retrieved mandant:', mandant);
      return mandant;
    } catch (error) {
      console.error('MandantService: Error fetching mandant by ID:', error);
      throw new Error('Fehler beim Laden des Mandanten');
    }
  }

  /**
   * Get mandanten by type
   */
  async getMandantenByType(typ: MandantTyp): Promise<Mandant[]> {
    try {
      console.log('MandantService: Fetching mandanten by type:', typ);

      const q = query(
        collection(db, this.mandantenCollection),
        where('typ', '==', typ),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const mandanten: Mandant[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        mandanten.push({
          mandantId: data.mandantId,
          name: data.name,
          typ: data.typ,
          adresse: data.adresse,
          createdAt: data.createdAt?.toDate() || new Date(),
          firmenDaten: data.firmenDaten,
          aktive: data.aktive !== undefined ? data.aktive : true
        });
      });

      console.log('MandantService: Retrieved mandanten by type:', mandanten.length);
      return mandanten;
    } catch (error) {
      console.error('MandantService: Error fetching mandanten by type:', error);
      throw new Error('Fehler beim Laden der Mandanten');
    }
  }

  /**
   * Update mandant
   */
  async updateMandant(mandantId: string, data: UpdateMandantRequest): Promise<void> {
    try {
      console.log('MandantService: Updating mandant:', mandantId, data);

      const q = query(
        collection(db, this.mandantenCollection),
        where('mandantId', '==', mandantId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Mandant nicht gefunden');
      }

      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, data as any);

      console.log('MandantService: Mandant updated successfully');
    } catch (error) {
      console.error('MandantService: Error updating mandant:', error);
      throw new Error('Fehler beim Aktualisieren des Mandanten');
    }
  }

  /**
   * Delete mandant (soft delete by setting aktive to false)
   */
  async deleteMandant(mandantId: string): Promise<void> {
    try {
      console.log('MandantService: Soft deleting mandant:', mandantId);
      await this.updateMandant(mandantId, { aktive: false });
      console.log('MandantService: Mandant soft deleted successfully');
    } catch (error) {
      console.error('MandantService: Error deleting mandant:', error);
      throw new Error('Fehler beim Löschen des Mandanten');
    }
  }

  /**
   * Hard delete mandant (permanently remove from database)
   */
  async hardDeleteMandant(mandantId: string): Promise<void> {
    try {
      console.log('MandantService: Hard deleting mandant:', mandantId);

      const q = query(
        collection(db, this.mandantenCollection),
        where('mandantId', '==', mandantId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Mandant nicht gefunden');
      }

      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);

      console.log('MandantService: Mandant hard deleted successfully');
    } catch (error) {
      console.error('MandantService: Error hard deleting mandant:', error);
      throw new Error('Fehler beim endgültigen Löschen des Mandanten');
    }
  }

  /**
   * Search mandanten by name
   */
  async searchMandanten(searchTerm: string): Promise<Mandant[]> {
    try {
      console.log('MandantService: Searching mandanten with term:', searchTerm);

      // Note: Firestore doesn't support full-text search, so we'll get all and filter client-side
      const allMandanten = await this.getAllMandanten();
      
      const filteredMandanten = allMandanten.filter(mandant =>
        mandant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('MandantService: Search results:', filteredMandanten.length);
      return filteredMandanten;
    } catch (error) {
      console.error('MandantService: Error searching mandanten:', error);
      throw new Error('Fehler bei der Mandanten-Suche');
    }
  }

  /**
   * Generate UUID for mandantId
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const mandantService = new MandantService(); 