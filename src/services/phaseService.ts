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
  Phase,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  Gewerk,
} from '../settings/types';

// Typen für die Übersicht
export interface TradeWithProgress extends Gewerk {
  progress: number;
  status: string;
}

export interface PhaseWithTrades extends Phase {
  trades: TradeWithProgress[];
}

export class PhaseService {
  private phaseCollection = 'phasen';
  private tradeCollection = 'trades';

  // Phasen einer Projekts + Gewerke mit Progress laden
  async getPhasesWithProgress(projectId: string, tenantId: string): Promise<PhaseWithTrades[]> {
    console.log('PhaseService: Loading phases with progress for project:', projectId);
    
    try {
      const phasesRef = collection(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection);
      const phaseSnapshot = await getDocs(phasesRef);
      const phases: PhaseWithTrades[] = [];

      for (const phaseDoc of phaseSnapshot.docs) {
        const phaseData = phaseDoc.data() as Phase;
        
        // Gewerke für diese Phase laden
        const tradesRef = collection(phaseDoc.ref, this.tradeCollection);
        const tradesSnapshot = await getDocs(tradesRef);

        const trades: TradeWithProgress[] = tradesSnapshot.docs.map(tradeDoc => {
          const tradeData = tradeDoc.data() as TradeWithProgress;
          return {
            ...tradeData,
            id: tradeDoc.id,
            progress: tradeData.progress ?? 0,
            status: tradeData.status ?? 'Geplant',
          };
        });

        phases.push({
          ...phaseData,
          id: phaseDoc.id,
          trades,
        });
      }

      // Sortiere Phasen nach Reihenfolge
      phases.sort((a, b) => a.reihenfolge - b.reihenfolge);
      
      console.log('PhaseService: Found phases:', phases.length);
      return phases;
    } catch (error) {
      console.error('PhaseService: Error loading phases:', error);
      throw new Error('Fehler beim Laden der Projektphasen');
    }
  }

  // Einzelne Phase anlegen
  async createPhase(
    projectId: string,
    tenantId: string,
    data: CreatePhaseRequest
  ): Promise<string> {
    console.log('PhaseService: Creating phase for project:', projectId);
    
    try {
      const phasesRef = collection(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection);
      const newPhase = await addDoc(phasesRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('PhaseService: Phase created with ID:', newPhase.id);
      return newPhase.id;
    } catch (error) {
      console.error('PhaseService: Error creating phase:', error);
      throw new Error('Fehler beim Erstellen der Phase');
    }
  }

  // Phase aktualisieren
  async updatePhase(
    projectId: string,
    tenantId: string,
    phaseId: string,
    data: UpdatePhaseRequest
  ): Promise<void> {
    console.log('PhaseService: Updating phase:', phaseId);
    
    try {
      const phaseRef = doc(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection, phaseId);
      await updateDoc(phaseRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      
      console.log('PhaseService: Phase updated successfully');
    } catch (error) {
      console.error('PhaseService: Error updating phase:', error);
      throw new Error('Fehler beim Aktualisieren der Phase');
    }
  }

  // Phase löschen
  async deletePhase(projectId: string, tenantId: string, phaseId: string): Promise<void> {
    console.log('PhaseService: Deleting phase:', phaseId);
    
    try {
      const phaseRef = doc(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection, phaseId);
      await deleteDoc(phaseRef);
      
      console.log('PhaseService: Phase deleted successfully');
    } catch (error) {
      console.error('PhaseService: Error deleting phase:', error);
      throw new Error('Fehler beim Löschen der Phase');
    }
  }

  // Gewerke/Fortschritt in einer Phase aktualisieren
  async updateTradeProgress(
    projectId: string,
    phaseId: string,
    tradeId: string,
    status: string,
    progress: number,
    tenantId: string
  ): Promise<void> {
    console.log('PhaseService: Updating trade progress:', { tradeId, status, progress });
    
    try {
      const tradeRef = doc(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        this.phaseCollection,
        phaseId,
        this.tradeCollection,
        tradeId
      );
      
      await updateDoc(tradeRef, {
        status,
        progress,
        updatedAt: Timestamp.now(),
      });
      
      console.log('PhaseService: Trade progress updated successfully');
    } catch (error) {
      console.error('PhaseService: Error updating trade progress:', error);
      throw new Error('Fehler beim Aktualisieren des Gewerk-Fortschritts');
    }
  }

  // Gewerk zu einer Phase hinzufügen
  async addTradeToPhase(
    projectId: string,
    phaseId: string,
    tenantId: string,
    tradeData: Partial<Gewerk>
  ): Promise<string> {
    console.log('PhaseService: Adding trade to phase:', phaseId);
    
    try {
      const tradesRef = collection(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        this.phaseCollection,
        phaseId,
        this.tradeCollection
      );
      
      const newTrade = await addDoc(tradesRef, {
        ...tradeData,
        progress: 0,
        status: 'Geplant',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('PhaseService: Trade added with ID:', newTrade.id);
      return newTrade.id;
    } catch (error) {
      console.error('PhaseService: Error adding trade:', error);
      throw new Error('Fehler beim Hinzufügen des Gewerks');
    }
  }

  // Gewerk aus einer Phase entfernen
  async removeTradeFromPhase(
    projectId: string,
    phaseId: string,
    tradeId: string,
    tenantId: string
  ): Promise<void> {
    console.log('PhaseService: Removing trade from phase:', tradeId);
    
    try {
      const tradeRef = doc(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        this.phaseCollection,
        phaseId,
        this.tradeCollection,
        tradeId
      );
      
      await deleteDoc(tradeRef);
      console.log('PhaseService: Trade removed successfully');
    } catch (error) {
      console.error('PhaseService: Error removing trade:', error);
      throw new Error('Fehler beim Entfernen des Gewerks');
    }
  }

  // Gesamtfortschritt eines Projekts berechnen
  calculateOverallProgress(phases: PhaseWithTrades[]): number {
    if (phases.length === 0) return 0;
    
    let totalProgress = 0;
    let totalTrades = 0;
    
    phases.forEach(phase => {
      phase.trades.forEach(trade => {
        totalProgress += trade.progress || 0;
        totalTrades++;
      });
    });
    
    return totalTrades > 0 ? Math.round(totalProgress / totalTrades) : 0;
  }

  // Standard-Phasen für ein neues Projekt initialisieren
  async initializeDefaultPhases(
    projectId: string,
    tenantId: string,
    createdBy: string
  ): Promise<void> {
    console.log('PhaseService: Initializing default phases for project:', projectId);
    
    try {
      // Standard-Phasen aus phasen_gewerke.json laden
      const defaultPhasesData = [
        {
          name: "1. Projektvorbereitung",
          gewerke: [
            "Kostenrahmen und Budget festlegen",
            "Finanzierungsplan erstellen",
            "Finanzierungsangebote einholen und vergleichen",
            "Darlehensvertrag abschließen",
            "Grundstück auswählen und prüfen (Grundbuch, Altlasten, Baulasten)",
            "Notartermin organisieren und Kaufvertrag beurkunden",
            "Auflassungsvormerkung im Grundbuch eintragen lassen",
            "Bauherrenversicherungen abschließen (Haftpflicht, Bauleistungsversicherung)"
          ]
        },
        {
          name: "2. Planung & Genehmigung",
          gewerke: [
            "Architekten/Planer beauftragen",
            "Bedarfsplanung (Größe, Nutzung, Raumaufteilung)",
            "Vermessung und Lageplan erstellen lassen",
            "Bodengutachten beauftragen",
            "Entwurfsplanung erstellen",
            "Bauantrag vorbereiten und einreichen",
            "Statische Berechnung und Wärmeschutznachweis beauftragen",
            "Energieberater für KfW-Förderung einbinden",
            "Baugenehmigung abwarten und prüfen"
          ]
        },
        {
          name: "3. Ausschreibung & Vergabe",
          gewerke: [
            "Leistungsverzeichnisse für Gewerke erstellen",
            "Angebote einholen und vergleichen",
            "Verträge mit Gewerken abschließen",
            "Bauleiter benennen",
            "Bauzeitenplan erstellen",
            "Baubeginn bei Bauamt anzeigen"
          ]
        },
        {
          name: "4. Rohbau",
          gewerke: [
            "Erdarbeiten (Aushub, Bodenplatte)",
            "Fundament erstellen",
            "Keller- oder Bodenplatte herstellen",
            "Rohbau: Mauerwerksbau / Betonbau",
            "Decken und Treppen einbauen",
            "Dachstuhl errichten",
            "Dacheindeckung und Abdichtung",
            "Fenster und Außentüren einbauen"
          ]
        },
        {
          name: "5. Technische Gebäudeausrüstung (TGA)",
          gewerke: [
            "Elektroinstallation (Leitungen, Dosen, Verteilung)",
            "Sanitärinstallation (Wasser, Abwasser)",
            "Heizung installieren (z. B. Wärmepumpe, Gas, Fußbodenheizung)",
            "Lüftungsanlage einbauen",
            "Smart Home / Netzwerktechnik vorbereiten"
          ]
        },
        {
          name: "6. Innenausbau",
          gewerke: [
            "Innenputz auftragen",
            "Estrich einbringen und austrocknen lassen",
            "Trockenbau (Wände, Decken, Dämmung)",
            "Maler- und Tapezierarbeiten",
            "Fliesenarbeiten (Bad, Küche, Bodenbeläge)",
            "Türen montieren (Innenbereich)",
            "Bodenbeläge verlegen (Parkett, Vinyl, Teppich)",
            "Sanitärobjekte und Elektromontage durchführen"
          ]
        },
        {
          name: "7. Außenanlagen & Abschluss",
          gewerke: [
            "Fassade fertigstellen (Putz, Dämmung, Verkleidung)",
            "Terrasse, Wege und Zufahrten pflastern",
            "Garten anlegen (Rasen, Bepflanzung)",
            "Zäune, Einfriedungen aufstellen",
            "Bauendreinigung innen & außen",
            "Abnahme mit Handwerkern / Bauleitung durchführen",
            "Restarbeiten / Mängel beheben lassen",
            "Dokumentation und Übergabe",
            "Haus bei Versorgern anmelden (Strom, Wasser, Abfall)",
            "Einzug vorbereiten"
          ]
        }
      ];

      // Phasen erstellen
      for (const phaseData of defaultPhasesData) {
                 const phaseId = await this.createPhase(projectId, tenantId, {
           name: phaseData.name,
           beschreibung: `Standard-Phase: ${phaseData.name}`,
           reihenfolge: defaultPhasesData.indexOf(phaseData) + 1,
           status: 'aktiv',
           gewerke: [],
         });

                 // Gewerke für diese Phase erstellen
         for (const gewerkName of phaseData.gewerke) {
           await this.addTradeToPhase(projectId, phaseId, tenantId, {
             name: gewerkName,
             beschreibung: `Standard-Gewerk: ${gewerkName}`,
             kategorie: 'Standard',
           });
         }
      }

      console.log('PhaseService: Default phases initialized successfully');
    } catch (error) {
      console.error('PhaseService: Error initializing default phases:', error);
      throw new Error('Fehler beim Initialisieren der Standard-Phasen');
    }
  }

  // Prüfen ob Phasen für ein Projekt existieren
  async hasPhases(projectId: string, tenantId: string): Promise<boolean> {
    try {
      const phasesRef = collection(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection);
      const phaseSnapshot = await getDocs(phasesRef);
      return !phaseSnapshot.empty;
    } catch (error) {
      console.error('PhaseService: Error checking phases:', error);
      return false;
    }
  }
}

// Exportiere eine Instanz für einfache Verwendung
export const phaseService = new PhaseService();
  