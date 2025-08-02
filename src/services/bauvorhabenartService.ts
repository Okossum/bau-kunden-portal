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
  Bauvorhabenart,
  CreateBauvorhabenartRequest,
  UpdateBauvorhabenartRequest
} from '../settings/types';

export class BauvorhabenartService {
  private bauvorhabenartCollection = 'bauvorhabenarten';

  // Bauvorhabenart erstellen
  async createBauvorhabenart(
    tenantId: string,
    data: CreateBauvorhabenartRequest,
    createdBy: string
  ): Promise<string> {
    console.log('BauvorhabenartService: Creating bauvorhabenart for tenant:', tenantId);
    
    try {
      const bauvorhabenartRef = collection(db, 'tenants', tenantId, this.bauvorhabenartCollection);
      const newBauvorhabenart = await addDoc(bauvorhabenartRef, {
        ...data,
        phasen: data.phasen || [],
        status: data.status || 'aktiv',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
        updatedBy: createdBy,
      });
      
      console.log('BauvorhabenartService: Bauvorhabenart created with ID:', newBauvorhabenart.id);
      return newBauvorhabenart.id;
    } catch (error) {
      console.error('BauvorhabenartService: Error creating bauvorhabenart:', error);
      throw new Error('Fehler beim Erstellen der Bauvorhabenart');
    }
  }

  // Alle Bauvorhabenarten eines Mandanten laden
  async getBauvorhabenartenByTenant(tenantId: string): Promise<Bauvorhabenart[]> {
    console.log('BauvorhabenartService: Loading bauvorhabenarten for tenant:', tenantId);
    
    try {
      const bauvorhabenartRef = collection(db, 'tenants', tenantId, this.bauvorhabenartCollection);
      const q = query(bauvorhabenartRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      const bauvorhabenarten: Bauvorhabenart[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          beschreibung: data.beschreibung,
          kategorie: data.kategorie,
          status: data.status || 'aktiv',
          standardDauer: data.standardDauer,
          phasen: data.phasen || [],
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
        };
      });
      
      console.log('BauvorhabenartService: Found bauvorhabenarten:', bauvorhabenarten.length);
      return bauvorhabenarten;
    } catch (error) {
      console.error('BauvorhabenartService: Error loading bauvorhabenarten:', error);
      throw new Error('Fehler beim Laden der Bauvorhabenarten');
    }
  }

  // Einzelne Bauvorhabenart laden
  async getBauvorhabenartById(tenantId: string, bauvorhabenartId: string): Promise<Bauvorhabenart | null> {
    console.log('BauvorhabenartService: Loading bauvorhabenart:', bauvorhabenartId);
    
    try {
      const bauvorhabenartRef = doc(db, 'tenants', tenantId, this.bauvorhabenartCollection, bauvorhabenartId);
      const docSnap = await getDoc(bauvorhabenartRef);
      
      if (!docSnap.exists()) {
        console.log('BauvorhabenartService: Bauvorhabenart not found');
        return null;
      }
      
      const data = docSnap.data();
      const bauvorhabenart: Bauvorhabenart = {
        id: docSnap.id,
        name: data.name,
        beschreibung: data.beschreibung,
        kategorie: data.kategorie,
        status: data.status || 'aktiv',
        standardDauer: data.standardDauer,
        phasen: data.phasen || [],
        metadata: data.metadata,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      };
      
      console.log('BauvorhabenartService: Bauvorhabenart loaded successfully');
      return bauvorhabenart;
    } catch (error) {
      console.error('BauvorhabenartService: Error loading bauvorhabenart:', error);
      throw new Error('Fehler beim Laden der Bauvorhabenart');
    }
  }

  // Bauvorhabenart aktualisieren
  async updateBauvorhabenart(
    tenantId: string,
    bauvorhabenartId: string,
    data: UpdateBauvorhabenartRequest,
    updatedBy: string
  ): Promise<void> {
    console.log('BauvorhabenartService: Updating bauvorhabenart:', bauvorhabenartId);
    
    try {
      const bauvorhabenartRef = doc(db, 'tenants', tenantId, this.bauvorhabenartCollection, bauvorhabenartId);
      await updateDoc(bauvorhabenartRef, {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy,
      });
      
      console.log('BauvorhabenartService: Bauvorhabenart updated successfully');
    } catch (error) {
      console.error('BauvorhabenartService: Error updating bauvorhabenart:', error);
      throw new Error('Fehler beim Aktualisieren der Bauvorhabenart');
    }
  }

  // Bauvorhabenart löschen
  async deleteBauvorhabenart(tenantId: string, bauvorhabenartId: string): Promise<void> {
    console.log('BauvorhabenartService: Deleting bauvorhabenart:', bauvorhabenartId);
    
    try {
      const bauvorhabenartRef = doc(db, 'tenants', tenantId, this.bauvorhabenartCollection, bauvorhabenartId);
      await deleteDoc(bauvorhabenartRef);
      
      console.log('BauvorhabenartService: Bauvorhabenart deleted successfully');
    } catch (error) {
      console.error('BauvorhabenartService: Error deleting bauvorhabenart:', error);
      throw new Error('Fehler beim Löschen der Bauvorhabenart');
    }
  }

  // Bauvorhabenarten nach Kategorie filtern
  async getBauvorhabenartenByKategorie(tenantId: string, kategorie: string): Promise<Bauvorhabenart[]> {
    console.log('BauvorhabenartService: Loading bauvorhabenarten by category:', kategorie);
    
    try {
      const bauvorhabenartRef = collection(db, 'tenants', tenantId, this.bauvorhabenartCollection);
      const q = query(
        bauvorhabenartRef,
        where('kategorie', '==', kategorie),
        where('status', '==', 'aktiv'),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      
      const bauvorhabenarten: Bauvorhabenart[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          beschreibung: data.beschreibung,
          kategorie: data.kategorie,
          status: data.status || 'aktiv',
          standardDauer: data.standardDauer,
          phasen: data.phasen || [],
          metadata: data.metadata,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
        };
      });
      
      console.log('BauvorhabenartService: Found bauvorhabenarten by category:', bauvorhabenarten.length);
      return bauvorhabenarten;
    } catch (error) {
      console.error('BauvorhabenartService: Error loading bauvorhabenarten by category:', error);
      throw new Error('Fehler beim Laden der Bauvorhabenarten nach Kategorie');
    }
  }

  // Bauvorhabenarten suchen
  async searchBauvorhabenarten(tenantId: string, searchTerm: string): Promise<Bauvorhabenart[]> {
    console.log('BauvorhabenartService: Searching bauvorhabenarten:', searchTerm);
    
    try {
      const bauvorhabenarten = await this.getBauvorhabenartenByTenant(tenantId);
      
      const filtered = bauvorhabenarten.filter(bauvorhabenart => 
        bauvorhabenart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bauvorhabenart.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bauvorhabenart.kategorie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log('BauvorhabenartService: Search results:', filtered.length);
      return filtered;
    } catch (error) {
      console.error('BauvorhabenartService: Error searching bauvorhabenarten:', error);
      throw new Error('Fehler bei der Suche nach Bauvorhabenarten');
    }
  }

  // Standard-Bauvorhabenarten für einen Mandanten initialisieren
  async initializeDefaultBauvorhabenarten(tenantId: string, createdBy: string): Promise<void> {
    console.log('BauvorhabenartService: Initializing default bauvorhabenarten for tenant:', tenantId);
    
    try {
      const defaultBauvorhabenarten = [
        {
          name: 'Einfamilienhaus',
          beschreibung: 'Standard-Bauvorhabenart für Einfamilienhäuser',
          kategorie: 'Wohnungsbau',
          standardDauer: 180,
          phasen: [],
        },
        {
          name: 'Mehrfamilienhaus',
          beschreibung: 'Standard-Bauvorhabenart für Mehrfamilienhäuser',
          kategorie: 'Wohnungsbau',
          standardDauer: 240,
          phasen: [],
        },
        {
          name: 'Bürogebäude',
          beschreibung: 'Standard-Bauvorhabenart für Bürogebäude',
          kategorie: 'Gewerbebau',
          standardDauer: 300,
          phasen: [],
        },
        {
          name: 'Industriehalle',
          beschreibung: 'Standard-Bauvorhabenart für Industriehallen',
          kategorie: 'Industriebau',
          standardDauer: 150,
          phasen: [],
        },
        {
          name: 'Sanierung',
          beschreibung: 'Standard-Bauvorhabenart für Sanierungsprojekte',
          kategorie: 'Sanierung',
          standardDauer: 120,
          phasen: [],
        },
      ];

      for (const bauvorhabenartData of defaultBauvorhabenarten) {
        await this.createBauvorhabenart(tenantId, bauvorhabenartData, createdBy);
      }
      
      console.log('BauvorhabenartService: Default bauvorhabenarten initialized successfully');
    } catch (error) {
      console.error('BauvorhabenartService: Error initializing default bauvorhabenarten:', error);
      throw new Error('Fehler beim Initialisieren der Standard-Bauvorhabenarten');
    }
  }

  // Prüfen ob Bauvorhabenarten für einen Mandanten existieren
  async hasBauvorhabenarten(tenantId: string): Promise<boolean> {
    try {
      const bauvorhabenartRef = collection(db, 'tenants', tenantId, this.bauvorhabenartCollection);
      const snapshot = await getDocs(bauvorhabenartRef);
      return !snapshot.empty;
    } catch (error) {
      console.error('BauvorhabenartService: Error checking bauvorhabenarten:', error);
      return false;
    }
  }

  // Phasen zu einer Bauvorhabenart hinzufügen
  async addPhaseToBauvorhabenart(
    tenantId: string,
    bauvorhabenartId: string,
    phaseId: string,
    updatedBy: string
  ): Promise<void> {
    console.log('BauvorhabenartService: Adding phase to bauvorhabenart:', phaseId);
    
    try {
      const bauvorhabenartRef = doc(db, 'tenants', tenantId, this.bauvorhabenartCollection, bauvorhabenartId);
      const docSnap = await getDoc(bauvorhabenartRef);
      
      if (!docSnap.exists()) {
        throw new Error('Bauvorhabenart nicht gefunden');
      }
      
      const currentData = docSnap.data();
      const currentPhasen = currentData.phasen || [];
      
      if (!currentPhasen.includes(phaseId)) {
        const updatedPhasen = [...currentPhasen, phaseId];
        
        await updateDoc(bauvorhabenartRef, {
          phasen: updatedPhasen,
          updatedAt: Timestamp.now(),
          updatedBy,
        });
        
        console.log('BauvorhabenartService: Phase added successfully');
      }
    } catch (error) {
      console.error('BauvorhabenartService: Error adding phase:', error);
      throw new Error('Fehler beim Hinzufügen der Phase');
    }
  }

  // Phasen von einer Bauvorhabenart entfernen
  async removePhaseFromBauvorhabenart(
    tenantId: string,
    bauvorhabenartId: string,
    phaseId: string,
    updatedBy: string
  ): Promise<void> {
    console.log('BauvorhabenartService: Removing phase from bauvorhabenart:', phaseId);
    
    try {
      const bauvorhabenartRef = doc(db, 'tenants', tenantId, this.bauvorhabenartCollection, bauvorhabenartId);
      const docSnap = await getDoc(bauvorhabenartRef);
      
      if (!docSnap.exists()) {
        throw new Error('Bauvorhabenart nicht gefunden');
      }
      
      const currentData = docSnap.data();
      const currentPhasen = currentData.phasen || [];
      
      const updatedPhasen = currentPhasen.filter((id: string) => id !== phaseId);
      
      await updateDoc(bauvorhabenartRef, {
        phasen: updatedPhasen,
        updatedAt: Timestamp.now(),
        updatedBy,
      });
      
      console.log('BauvorhabenartService: Phase removed successfully');
    } catch (error) {
      console.error('BauvorhabenartService: Error removing phase:', error);
      throw new Error('Fehler beim Entfernen der Phase');
    }
  }

  // Alle Phasen einer Bauvorhabenart laden
  async getPhasenForBauvorhabenart(
    tenantId: string,
    bauvorhabenartId: string
  ): Promise<string[]> {
    console.log('BauvorhabenartService: Loading phases for bauvorhabenart:', bauvorhabenartId);
    
    try {
      const bauvorhabenart = await this.getBauvorhabenartById(tenantId, bauvorhabenartId);
      if (!bauvorhabenart) {
        throw new Error('Bauvorhabenart nicht gefunden');
      }
      
      console.log('BauvorhabenartService: Found phases:', bauvorhabenart.phasen.length);
      return bauvorhabenart.phasen;
    } catch (error) {
      console.error('BauvorhabenartService: Error loading phases:', error);
      throw new Error('Fehler beim Laden der Phasen');
    }
  }
}

// Exportiere eine Instanz für einfache Verwendung
export const bauvorhabenartService = new BauvorhabenartService(); 