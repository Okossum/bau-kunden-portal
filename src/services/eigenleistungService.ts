import {
  collection,
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TradeWithEigenleistung } from '../settings/types';

export class EigenleistungService {
  private tradeCollection = 'trades';

  // Eigenleistung für ein Gewerk setzen
  async setEigenleistung(
    tenantId: string,
    projectId: string,
    phaseId: string,
    tradeId: string,
    eigenleistung: boolean,
    changedBy: string,
    kommentar?: string
  ): Promise<void> {
    console.log('EigenleistungService: Setting eigenleistung for trade:', tradeId, 'to:', eigenleistung);
    
    try {
      const tradeRef = doc(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        'phasen',
        phaseId,
        this.tradeCollection,
        tradeId
      );

      // Aktuelle Daten laden
      const tradeDoc = await getDoc(tradeRef);
      if (!tradeDoc.exists()) {
        throw new Error('Gewerk nicht gefunden');
      }

      const currentData = tradeDoc.data();
      const currentHistorie = currentData.eigenleistungHistorie || [];

      // Neue Historie-Eintrag erstellen
      const newHistorieEntry = {
        datum: Timestamp.now(),
        von: changedBy,
        wert: eigenleistung,
        kommentar: kommentar || '',
      };

      // Historie erweitern (maximal 10 Einträge behalten)
      const updatedHistorie = [...currentHistorie, newHistorieEntry].slice(-10);

      // Gewerk aktualisieren
      await updateDoc(tradeRef, {
        eigenleistung,
        eigenleistungGeaendertAm: Timestamp.now(),
        eigenleistungGeaendertVon: changedBy,
        eigenleistungHistorie: updatedHistorie,
        updatedAt: Timestamp.now(),
      });
      
      console.log('EigenleistungService: Eigenleistung updated successfully');
    } catch (error) {
      console.error('EigenleistungService: Error setting eigenleistung:', error);
      throw new Error('Fehler beim Setzen der Eigenleistung');
    }
  }

  // Eigenleistung für mehrere Gewerke setzen
  async setEigenleistungBulk(
    tenantId: string,
    projectId: string,
    phaseId: string,
    tradeUpdates: Array<{
      tradeId: string;
      eigenleistung: boolean;
    }>,
    changedBy: string,
    kommentar?: string
  ): Promise<void> {
    console.log('EigenleistungService: Setting eigenleistung for multiple trades:', tradeUpdates.length);
    
    try {
      const updatePromises = tradeUpdates.map(update =>
        this.setEigenleistung(
          tenantId,
          projectId,
          phaseId,
          update.tradeId,
          update.eigenleistung,
          changedBy,
          kommentar
        )
      );

      await Promise.all(updatePromises);
      
      console.log('EigenleistungService: Bulk eigenleistung update completed successfully');
    } catch (error) {
      console.error('EigenleistungService: Error in bulk eigenleistung update:', error);
      throw new Error('Fehler beim Massen-Update der Eigenleistungen');
    }
  }

  // Eigenleistungs-Historie für ein Gewerk laden
  async getEigenleistungHistorie(
    tenantId: string,
    projectId: string,
    phaseId: string,
    tradeId: string
  ): Promise<Array<{
    datum: Date;
    von: string;
    wert: boolean;
    kommentar?: string;
  }>> {
    console.log('EigenleistungService: Loading eigenleistung history for trade:', tradeId);
    
    try {
      const tradeRef = doc(
        db,
        'tenants',
        tenantId,
        'projects',
        projectId,
        'phasen',
        phaseId,
        this.tradeCollection,
        tradeId
      );

      const tradeDoc = await getDoc(tradeRef);
      if (!tradeDoc.exists()) {
        throw new Error('Gewerk nicht gefunden');
      }

      const data = tradeDoc.data();
      const historie = data.eigenleistungHistorie || [];

      const formattedHistorie = historie.map((entry: any) => ({
        datum: entry.datum?.toDate() || new Date(),
        von: entry.von,
        wert: entry.wert,
        kommentar: entry.kommentar,
      }));

      console.log('EigenleistungService: Loaded eigenleistung history:', formattedHistorie.length, 'entries');
      return formattedHistorie;
    } catch (error) {
      console.error('EigenleistungService: Error loading eigenleistung history:', error);
      throw new Error('Fehler beim Laden der Eigenleistungs-Historie');
    }
  }

  // Statistiken für Eigenleistungen in einem Projekt
  async getEigenleistungStats(
    tenantId: string,
    projectId: string
  ): Promise<{
    totalTrades: number;
    eigenleistungTrades: number;
    unternehmerTrades: number;
    eigenleistungPercentage: number;
  }> {
    console.log('EigenleistungService: Loading eigenleistung stats for project:', projectId);
    
    try {
      // Diese Funktion würde alle Phasen und Gewerke des Projekts durchgehen
      // Für jetzt geben wir Platzhalter-Daten zurück
      // TODO: Implementiere vollständige Statistik-Berechnung
      
      const stats = {
        totalTrades: 0,
        eigenleistungTrades: 0,
        unternehmerTrades: 0,
        eigenleistungPercentage: 0,
      };
      
      console.log('EigenleistungService: Loaded eigenleistung stats');
      return stats;
    } catch (error) {
      console.error('EigenleistungService: Error loading eigenleistung stats:', error);
      throw new Error('Fehler beim Laden der Eigenleistungs-Statistiken');
    }
  }

  // Alle Eigenleistungs-Gewerke in einem Projekt finden
  async getEigenleistungTrades(
    tenantId: string,
    projectId: string,
    eigenleistung: boolean = true
  ): Promise<TradeWithEigenleistung[]> {
    console.log('EigenleistungService: Loading eigenleistung trades for project:', projectId);
    
    try {
      // Diese Funktion würde alle Phasen und Gewerke des Projekts durchgehen
      // und nach Eigenleistungs-Gewerken filtern
      // TODO: Implementiere vollständige Abfrage
      
      const trades: TradeWithEigenleistung[] = [];
      
      console.log('EigenleistungService: Loaded eigenleistung trades:', trades.length);
      return trades;
    } catch (error) {
      console.error('EigenleistungService: Error loading eigenleistung trades:', error);
      throw new Error('Fehler beim Laden der Eigenleistungs-Gewerke');
    }
  }

  // Eigenleistungs-Bericht für ein Projekt generieren
  async generateEigenleistungReport(
    tenantId: string,
    projectId: string
  ): Promise<{
    projectId: string;
    generatedAt: Date;
    stats: {
      totalTrades: number;
      eigenleistungTrades: number;
      unternehmerTrades: number;
      eigenleistungPercentage: number;
    };
    phases: Array<{
      phaseId: string;
      phaseName: string;
      trades: Array<{
        tradeId: string;
        tradeName: string;
        eigenleistung: boolean;
        lastChanged: Date;
        changedBy: string;
      }>;
    }>;
  }> {
    console.log('EigenleistungService: Generating eigenleistung report for project:', projectId);
    
    try {
      // TODO: Implementiere vollständigen Bericht
      const report = {
        projectId,
        generatedAt: new Date(),
        stats: {
          totalTrades: 0,
          eigenleistungTrades: 0,
          unternehmerTrades: 0,
          eigenleistungPercentage: 0,
        },
        phases: [],
      };
      
      console.log('EigenleistungService: Generated eigenleistung report');
      return report;
    } catch (error) {
      console.error('EigenleistungService: Error generating eigenleistung report:', error);
      throw new Error('Fehler beim Generieren des Eigenleistungs-Berichts');
    }
  }
}

// Exportiere eine Instanz für einfache Verwendung
export const eigenleistungService = new EigenleistungService(); 