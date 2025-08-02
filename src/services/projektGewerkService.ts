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
  ProjektGewerk,
  CreateProjektGewerkRequest,
  UpdateProjektGewerkRequest
} from '../settings/types';

export class ProjektGewerkService {
  private projektGewerkeCollection = 'projektGewerke';

  /**
   * Create a new projekt gewerk
   */
  async createProjektGewerk(data: CreateProjektGewerkRequest, createdBy: string): Promise<ProjektGewerk> {
    try {
      console.log('ProjektGewerkService: Creating new projekt gewerk:', data);

      const projektGewerkId = this.generateUUID();
      const projektGewerkData = {
        id: projektGewerkId,
        projektId: data.projektId,
        gewerkId: data.gewerkId,
        phaseId: data.phaseId,
        status: data.status || 'geplant',
        startDatum: data.startDatum ? Timestamp.fromDate(data.startDatum) : null,
        endDatum: data.endDatum ? Timestamp.fromDate(data.endDatum) : null,
        tatsaechlicherStart: null,
        tatsaechlichesEnde: null,
        fortschritt: data.fortschritt || 0,
        handwerker: data.handwerker || [],
        materialien: data.materialien || [],
        kosten: data.kosten || null,
        notizen: data.notizen || null,
        dokumente: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: createdBy,
        updatedBy: createdBy
      };

      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      await setDoc(docRef, projektGewerkData);

      const createdProjektGewerk: ProjektGewerk = {
        ...projektGewerkData,
        startDatum: projektGewerkData.startDatum?.toDate(),
        endDatum: projektGewerkData.endDatum?.toDate(),
        tatsaechlicherStart: projektGewerkData.tatsaechlicherStart?.toDate(),
        tatsaechlichesEnde: projektGewerkData.tatsaechlichesEnde?.toDate(),
        createdAt: projektGewerkData.createdAt.toDate(),
        updatedAt: projektGewerkData.updatedAt.toDate()
      };

      console.log('ProjektGewerkService: Projekt gewerk created successfully:', createdProjektGewerk);
      return createdProjektGewerk;
    } catch (error) {
      console.error('ProjektGewerkService: Error creating projekt gewerk:', error);
      throw new Error('Fehler beim Erstellen des Projekt-Gewerks');
    }
  }

  /**
   * Get all projekt gewerke for a project
   */
  async getProjektGewerkeByProject(projektId: string): Promise<ProjektGewerk[]> {
    try {
      console.log('ProjektGewerkService: Fetching projekt gewerke for project:', projektId);
      
      const q = query(
        collection(db, this.projektGewerkeCollection),
        where('projektId', '==', projektId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const projektGewerke: ProjektGewerk[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projektGewerke.push({
          ...data,
          startDatum: data.startDatum?.toDate(),
          endDatum: data.endDatum?.toDate(),
          tatsaechlicherStart: data.tatsaechlicherStart?.toDate(),
          tatsaechlichesEnde: data.tatsaechlichesEnde?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as ProjektGewerk);
      });
      
      console.log('ProjektGewerkService: Found projekt gewerke:', projektGewerke.length);
      return projektGewerke;
    } catch (error) {
      console.error('ProjektGewerkService: Error fetching projekt gewerke:', error);
      throw new Error('Fehler beim Laden der Projekt-Gewerke');
    }
  }

  /**
   * Get projekt gewerke by phase
   */
  async getProjektGewerkeByPhase(projektId: string, phaseId: string): Promise<ProjektGewerk[]> {
    try {
      console.log('ProjektGewerkService: Fetching projekt gewerke for phase:', phaseId);
      
      const q = query(
        collection(db, this.projektGewerkeCollection),
        where('projektId', '==', projektId),
        where('phaseId', '==', phaseId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const projektGewerke: ProjektGewerk[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projektGewerke.push({
          ...data,
          startDatum: data.startDatum?.toDate(),
          endDatum: data.endDatum?.toDate(),
          tatsaechlicherStart: data.tatsaechlicherStart?.toDate(),
          tatsaechlichesEnde: data.tatsaechlichesEnde?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as ProjektGewerk);
      });
      
      console.log('ProjektGewerkService: Found projekt gewerke for phase:', projektGewerke.length);
      return projektGewerke;
    } catch (error) {
      console.error('ProjektGewerkService: Error fetching projekt gewerke by phase:', error);
      throw new Error('Fehler beim Laden der Projekt-Gewerke nach Phase');
    }
  }

  /**
   * Get projekt gewerk by ID
   */
  async getProjektGewerkById(projektGewerkId: string): Promise<ProjektGewerk | null> {
    try {
      console.log('ProjektGewerkService: Fetching projekt gewerk by ID:', projektGewerkId);
      
      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const projektGewerk: ProjektGewerk = {
          ...data,
          startDatum: data.startDatum?.toDate(),
          endDatum: data.endDatum?.toDate(),
          tatsaechlicherStart: data.tatsaechlicherStart?.toDate(),
          tatsaechlichesEnde: data.tatsaechlichesEnde?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as ProjektGewerk;
        
        console.log('ProjektGewerkService: Found projekt gewerk:', projektGewerk);
        return projektGewerk;
      } else {
        console.log('ProjektGewerkService: Projekt gewerk not found');
        return null;
      }
    } catch (error) {
      console.error('ProjektGewerkService: Error fetching projekt gewerk:', error);
      throw new Error('Fehler beim Laden des Projekt-Gewerks');
    }
  }

  /**
   * Update projekt gewerk
   */
  async updateProjektGewerk(projektGewerkId: string, data: UpdateProjektGewerkRequest, updatedBy: string): Promise<void> {
    try {
      console.log('ProjektGewerkService: Updating projekt gewerk:', projektGewerkId, data);
      
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: updatedBy
      };

      // Handle date fields
      if (data.startDatum) {
        updateData.startDatum = Timestamp.fromDate(data.startDatum);
      }
      if (data.endDatum) {
        updateData.endDatum = Timestamp.fromDate(data.endDatum);
      }
      if (data.tatsaechlicherStart) {
        updateData.tatsaechlicherStart = Timestamp.fromDate(data.tatsaechlicherStart);
      }
      if (data.tatsaechlichesEnde) {
        updateData.tatsaechlichesEnde = Timestamp.fromDate(data.tatsaechlichesEnde);
      }
      
      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      await updateDoc(docRef, updateData);
      
      console.log('ProjektGewerkService: Projekt gewerk updated successfully');
    } catch (error) {
      console.error('ProjektGewerkService: Error updating projekt gewerk:', error);
      throw new Error('Fehler beim Aktualisieren des Projekt-Gewerks');
    }
  }

  /**
   * Delete projekt gewerk
   */
  async deleteProjektGewerk(projektGewerkId: string): Promise<void> {
    try {
      console.log('ProjektGewerkService: Deleting projekt gewerk:', projektGewerkId);
      
      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      await deleteDoc(docRef);
      
      console.log('ProjektGewerkService: Projekt gewerk deleted successfully');
    } catch (error) {
      console.error('ProjektGewerkService: Error deleting projekt gewerk:', error);
      throw new Error('Fehler beim Löschen des Projekt-Gewerks');
    }
  }

  /**
   * Update progress for a projekt gewerk
   */
  async updateProgress(projektGewerkId: string, fortschritt: number, updatedBy: string): Promise<void> {
    try {
      console.log('ProjektGewerkService: Updating progress for projekt gewerk:', projektGewerkId, fortschritt);
      
      const updateData = {
        fortschritt: Math.max(0, Math.min(100, fortschritt)), // Ensure 0-100 range
        updatedAt: Timestamp.now(),
        updatedBy: updatedBy
      };
      
      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      await updateDoc(docRef, updateData);
      
      console.log('ProjektGewerkService: Progress updated successfully');
    } catch (error) {
      console.error('ProjektGewerkService: Error updating progress:', error);
      throw new Error('Fehler beim Aktualisieren des Fortschritts');
    }
  }

  /**
   * Update status for a projekt gewerk
   */
  async updateStatus(projektGewerkId: string, status: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert', updatedBy: string): Promise<void> {
    try {
      console.log('ProjektGewerkService: Updating status for projekt gewerk:', projektGewerkId, status);
      
      const updateData: any = {
        status: status,
        updatedAt: Timestamp.now(),
        updatedBy: updatedBy
      };

      // Set actual start/end dates based on status
      if (status === 'in Bearbeitung') {
        updateData.tatsaechlicherStart = Timestamp.now();
      } else if (status === 'abgeschlossen') {
        updateData.tatsaechlichesEnde = Timestamp.now();
        updateData.fortschritt = 100;
      }
      
      const docRef = doc(db, this.projektGewerkeCollection, projektGewerkId);
      await updateDoc(docRef, updateData);
      
      console.log('ProjektGewerkService: Status updated successfully');
    } catch (error) {
      console.error('ProjektGewerkService: Error updating status:', error);
      throw new Error('Fehler beim Aktualisieren des Status');
    }
  }

  /**
   * Get projekt gewerke with gewerk details
   */
  async getProjektGewerkeWithDetails(projektId: string): Promise<(ProjektGewerk & { gewerkDetails: any })[]> {
    try {
      console.log('ProjektGewerkService: Fetching projekt gewerke with details for project:', projektId);
      
      const projektGewerke = await this.getProjektGewerkeByProject(projektId);
      const gewerkService = (await import('./gewerkService')).gewerkService;
      
      const projektGewerkeWithDetails = await Promise.all(
        projektGewerke.map(async (projektGewerk) => {
          const gewerkDetails = await gewerkService.getGewerkById(projektGewerk.gewerkId);
          
          return {
            ...projektGewerk,
            gewerkDetails: gewerkDetails
          };
        })
      );
      
      console.log('ProjektGewerkService: Found projekt gewerke with details:', projektGewerkeWithDetails.length);
      return projektGewerkeWithDetails;
    } catch (error) {
      console.error('ProjektGewerkService: Error fetching projekt gewerke with details:', error);
      throw new Error('Fehler beim Laden der Projekt-Gewerke mit Details');
    }
  }

  /**
   * Calculate overall project progress
   */
  async calculateProjectProgress(projektId: string): Promise<number> {
    try {
      console.log('ProjektGewerkService: Calculating project progress for:', projektId);
      
      const projektGewerke = await this.getProjektGewerkeByProject(projektId);
      
      if (projektGewerke.length === 0) {
        return 0;
      }
      
      const totalProgress = projektGewerke.reduce((sum, gewerk) => sum + gewerk.fortschritt, 0);
      const averageProgress = Math.round(totalProgress / projektGewerke.length);
      
      console.log('ProjektGewerkService: Calculated project progress:', averageProgress + '%');
      return averageProgress;
    } catch (error) {
      console.error('ProjektGewerkService: Error calculating project progress:', error);
      throw new Error('Fehler beim Berechnen des Projekt-Fortschritts');
    }
  }

  /**
   * Generate UUID for projekt gewerk ID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const projektGewerkService = new ProjektGewerkService(); 