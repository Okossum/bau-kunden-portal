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
    Trade,
    TradeProgressUpdate,
  } from '../settings/types';
  
  // Typen für die Übersicht
  export interface TradeWithProgress extends Trade {
    progress: number;
    status: string;
  }
  export interface PhaseWithTrades extends Phase {
    trades: TradeWithProgress[];
  }
  
  export class PhaseService {
    private phaseCollection = 'projectPhases';
  
    // Phasen einer Projekts + Gewerke mit Progress laden
    async getPhasesWithProgress(projectId: string, tenantId: string): Promise<PhaseWithTrades[]> {
      const phasesRef = collection(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection);
      const phaseSnapshot = await getDocs(phasesRef);
      const phases: PhaseWithTrades[] = [];
  
      for (const phaseDoc of phaseSnapshot.docs) {
        const phaseData = phaseDoc.data() as Phase;
        // Gewerke laden
        const tradesRef = collection(phaseDoc.ref, 'trades');
        const tradesSnapshot = await getDocs(tradesRef);
  
        const trades: TradeWithProgress[] = tradesSnapshot.docs.map(tradeDoc => {
          const t = tradeDoc.data() as TradeWithProgress;
          return {
            ...t,
            progress: t.progress ?? 0,
            status: t.status ?? 'Geplant',
          };
        });
  
        phases.push({
          ...(phaseData as Phase),
          id: phaseDoc.id,
          trades,
        });
      }
      return phases;
    }
  
    // Einzelne Phase anlegen
    async createPhase(
      projectId: string,
      tenantId: string,
      data: CreatePhaseRequest
    ): Promise<string> {
      const phasesRef = collection(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection);
      const newPhase = await addDoc(phasesRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return newPhase.id;
    }
  
    // Phase aktualisieren
    async updatePhase(
      projectId: string,
      tenantId: string,
      phaseId: string,
      data: UpdatePhaseRequest
    ): Promise<void> {
      const phaseRef = doc(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection, phaseId);
      await updateDoc(phaseRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    }
  
    // Phase löschen
    async deletePhase(projectId: string, tenantId: string, phaseId: string): Promise<void> {
      const phaseRef = doc(db, 'tenants', tenantId, 'projects', projectId, this.phaseCollection, phaseId);
      await deleteDoc(phaseRef);
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
      const tradeRef = doc(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        this.phaseCollection,
        phaseId,
        'trades',
        tradeId
      );
      await updateDoc(tradeRef, {
        status,
        progress,
        updatedAt: Timestamp.now(),
      });
    }
  
    // Gesamtfortschritt eines Projekts berechnen
    calculateOverallProgress(phases: PhaseWithTrades[]): number {
      let total = 0;
      let count = 0;
      phases.forEach(phase => {
        phase.trades.forEach(trade => {
          total += trade.progress || 0;
          count++;
        });
      });
      return count > 0 ? Math.round(total / count) : 0;
    }
  }
  