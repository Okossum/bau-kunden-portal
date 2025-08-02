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
  Gewerk,
  CreateGewerkRequest,
  UpdateGewerkRequest
} from '../settings/types';

export class GewerkService {
  private gewerkeCollection = 'gewerke';

  /**
   * Create a new gewerk
   */
  async createGewerk(data: CreateGewerkRequest, createdBy: string): Promise<Gewerk> {
    try {
      console.log('GewerkService: Creating new gewerk:', data);

      const gewerkId = this.generateUUID();
      const gewerkData = {
        id: gewerkId,
        name: data.name,
        beschreibung: data.beschreibung || null,
        kategorie: data.kategorie || null,
        standardDauer: data.standardDauer || null,
        abhaengigkeiten: data.abhaengigkeiten || [],
        materialien: data.materialien || [],
        handwerker: data.handwerker || [],
        kosten: data.kosten || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: createdBy,
        updatedBy: createdBy
      };

      const docRef = doc(db, this.gewerkeCollection, gewerkId);
      await setDoc(docRef, gewerkData);

      const createdGewerk: Gewerk = {
        ...gewerkData,
        createdAt: gewerkData.createdAt.toDate(),
        updatedAt: gewerkData.updatedAt.toDate()
      };

      console.log('GewerkService: Gewerk created successfully:', createdGewerk);
      return createdGewerk;
    } catch (error) {
      console.error('GewerkService: Error creating gewerk:', error);
      throw new Error('Fehler beim Erstellen des Gewerks');
    }
  }

  /**
   * Get all gewerke
   */
  async getAllGewerke(): Promise<Gewerk[]> {
    try {
      console.log('GewerkService: Fetching all gewerke');
      
      const q = query(
        collection(db, this.gewerkeCollection),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const gewerke: Gewerk[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        gewerke.push({
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Gewerk);
      });
      
      console.log('GewerkService: Found gewerke:', gewerke.length);
      return gewerke;
    } catch (error) {
      console.error('GewerkService: Error fetching gewerke:', error);
      throw new Error('Fehler beim Laden der Gewerke');
    }
  }

  /**
   * Get gewerk by ID
   */
  async getGewerkById(gewerkId: string): Promise<Gewerk | null> {
    try {
      console.log('GewerkService: Fetching gewerk by ID:', gewerkId);
      
      const docRef = doc(db, this.gewerkeCollection, gewerkId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const gewerk: Gewerk = {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Gewerk;
        
        console.log('GewerkService: Found gewerk:', gewerk);
        return gewerk;
      } else {
        console.log('GewerkService: Gewerk not found');
        return null;
      }
    } catch (error) {
      console.error('GewerkService: Error fetching gewerk:', error);
      throw new Error('Fehler beim Laden des Gewerks');
    }
  }

  /**
   * Get gewerke by category
   */
  async getGewerkeByCategory(kategorie: string): Promise<Gewerk[]> {
    try {
      console.log('GewerkService: Fetching gewerke by category:', kategorie);
      
      const q = query(
        collection(db, this.gewerkeCollection),
        where('kategorie', '==', kategorie),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const gewerke: Gewerk[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        gewerke.push({
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Gewerk);
      });
      
      console.log('GewerkService: Found gewerke in category:', gewerke.length);
      return gewerke;
    } catch (error) {
      console.error('GewerkService: Error fetching gewerke by category:', error);
      throw new Error('Fehler beim Laden der Gewerke nach Kategorie');
    }
  }

  /**
   * Update gewerk
   */
  async updateGewerk(gewerkId: string, data: UpdateGewerkRequest, updatedBy: string): Promise<void> {
    try {
      console.log('GewerkService: Updating gewerk:', gewerkId, data);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: updatedBy
      };
      
      const docRef = doc(db, this.gewerkeCollection, gewerkId);
      await updateDoc(docRef, updateData);
      
      console.log('GewerkService: Gewerk updated successfully');
    } catch (error) {
      console.error('GewerkService: Error updating gewerk:', error);
      throw new Error('Fehler beim Aktualisieren des Gewerks');
    }
  }

  /**
   * Delete gewerk (soft delete by setting status to inactive)
   */
  async deleteGewerk(gewerkId: string): Promise<void> {
    try {
      console.log('GewerkService: Deleting gewerk:', gewerkId);
      
      const docRef = doc(db, this.gewerkeCollection, gewerkId);
      await deleteDoc(docRef);
      
      console.log('GewerkService: Gewerk deleted successfully');
    } catch (error) {
      console.error('GewerkService: Error deleting gewerk:', error);
      throw new Error('Fehler beim Löschen des Gewerks');
    }
  }

  /**
   * Search gewerke by name
   */
  async searchGewerke(searchTerm: string): Promise<Gewerk[]> {
    try {
      console.log('GewerkService: Searching gewerke with term:', searchTerm);
      
      const allGewerke = await this.getAllGewerke();
      const filteredGewerke = allGewerke.filter(gewerk =>
        gewerk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gewerk.beschreibung && gewerk.beschreibung.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (gewerk.kategorie && gewerk.kategorie.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      console.log('GewerkService: Found gewerke matching search:', filteredGewerke.length);
      return filteredGewerke;
    } catch (error) {
      console.error('GewerkService: Error searching gewerke:', error);
      throw new Error('Fehler bei der Gewerke-Suche');
    }
  }

  /**
   * Initialize default gewerke from phasen_gewerke.json
   */
  async initializeDefaultGewerke(createdBy: string): Promise<void> {
    try {
      console.log('GewerkService: Initializing default gewerke');
      
      // Import the default gewerke data
      const defaultGewerkeData = [
        {
          name: "Kostenrahmen und Budget festlegen",
          kategorie: "Planung",
          standardDauer: 5,
          materialien: ["Budgetplan", "Kostenkalkulation"],
          handwerker: ["Projektmanager", "Kalkulator"]
        },
        {
          name: "Finanzierungsplan erstellen",
          kategorie: "Planung",
          standardDauer: 3,
          materialien: ["Finanzierungsplan", "Bankunterlagen"],
          handwerker: ["Projektmanager", "Finanzberater"]
        },
        {
          name: "Grundstück auswählen und prüfen",
          kategorie: "Planung",
          standardDauer: 10,
          materialien: ["Grundbuchauszug", "Bodengutachten", "Altlastenprüfung"],
          handwerker: ["Projektmanager", "Gutachter"]
        },
        {
          name: "Architekten/Planer beauftragen",
          kategorie: "Planung",
          standardDauer: 7,
          materialien: ["Architektenvertrag", "Leistungsbeschreibung"],
          handwerker: ["Projektmanager", "Architekt"]
        },
        {
          name: "Bauantrag vorbereiten und einreichen",
          kategorie: "Genehmigung",
          standardDauer: 14,
          materialien: ["Bauantrag", "Pläne", "Statik"],
          handwerker: ["Architekt", "Projektmanager"]
        },
        {
          name: "Erdarbeiten (Aushub, Bodenplatte)",
          kategorie: "Rohbau",
          standardDauer: 7,
          materialien: ["Bagger", "Beton", "Bewehrung"],
          handwerker: ["Erdbauer", "Betonbauer"]
        },
        {
          name: "Fundament erstellen",
          kategorie: "Rohbau",
          standardDauer: 5,
          materialien: ["Beton", "Bewehrung", "Dämmung"],
          handwerker: ["Betonbauer", "Maurer"]
        },
        {
          name: "Rohbau: Mauerwerksbau / Betonbau",
          kategorie: "Rohbau",
          standardDauer: 21,
          materialien: ["Mauersteine", "Mörtel", "Beton"],
          handwerker: ["Maurer", "Betonbauer"]
        },
        {
          name: "Dachstuhl errichten",
          kategorie: "Rohbau",
          standardDauer: 7,
          materialien: ["Holz", "Dachziegel", "Dämmung"],
          handwerker: ["Zimmerer", "Dachdecker"]
        },
        {
          name: "Elektroinstallation",
          kategorie: "TGA",
          standardDauer: 14,
          materialien: ["Kabel", "Dosen", "Verteiler"],
          handwerker: ["Elektriker"]
        },
        {
          name: "Sanitärinstallation",
          kategorie: "TGA",
          standardDauer: 10,
          materialien: ["Rohre", "Armaturen", "Sanitärobjekte"],
          handwerker: ["Sanitärinstallateur"]
        },
        {
          name: "Heizung installieren",
          kategorie: "TGA",
          standardDauer: 7,
          materialien: ["Heizkessel", "Rohre", "Heizkörper"],
          handwerker: ["Heizungsbauer"]
        },
        {
          name: "Innenputz auftragen",
          kategorie: "Innenausbau",
          standardDauer: 10,
          materialien: ["Putz", "Gips"],
          handwerker: ["Stuckateur", "Maler"]
        },
        {
          name: "Maler- und Tapezierarbeiten",
          kategorie: "Innenausbau",
          standardDauer: 7,
          materialien: ["Farbe", "Tapete", "Kleister"],
          handwerker: ["Maler"]
        },
        {
          name: "Fliesenarbeiten",
          kategorie: "Innenausbau",
          standardDauer: 14,
          materialien: ["Fliesen", "Fliesenkleber", "Fugenmörtel"],
          handwerker: ["Fliesenleger"]
        },
        {
          name: "Bodenbeläge verlegen",
          kategorie: "Innenausbau",
          standardDauer: 7,
          materialien: ["Parkett", "Vinyl", "Teppich"],
          handwerker: ["Parkettleger", "Bodenleger"]
        },
        {
          name: "Fassade fertigstellen",
          kategorie: "Außenanlagen",
          standardDauer: 14,
          materialien: ["Putz", "Dämmung", "Verkleidung"],
          handwerker: ["Fassadenbauer", "Maler"]
        },
        {
          name: "Garten anlegen",
          kategorie: "Außenanlagen",
          standardDauer: 10,
          materialien: ["Erde", "Pflanzen", "Rasen"],
          handwerker: ["Gärtner", "Landschaftsbauer"]
        },
        {
          name: "Bauendreinigung",
          kategorie: "Abschluss",
          standardDauer: 3,
          materialien: ["Reinigungsmittel", "Geräte"],
          handwerker: ["Reinigungskraft"]
        },
        {
          name: "Abnahme durchführen",
          kategorie: "Abschluss",
          standardDauer: 1,
          materialien: ["Abnahmeprotokoll", "Checkliste"],
          handwerker: ["Projektmanager", "Bauleiter"]
        }
      ];

      // Check if gewerke already exist
      const existingGewerke = await this.getAllGewerke();
      if (existingGewerke.length > 0) {
        console.log('GewerkService: Gewerke already exist, skipping initialization');
        return;
      }

      // Create default gewerke
      for (const gewerkData of defaultGewerkeData) {
        await this.createGewerk(gewerkData, createdBy);
      }

      console.log('GewerkService: Default gewerke initialized successfully');
    } catch (error) {
      console.error('GewerkService: Error initializing default gewerke:', error);
      throw new Error('Fehler beim Initialisieren der Standard-Gewerke');
    }
  }

  /**
   * Generate UUID for gewerk ID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const gewerkService = new GewerkService(); 