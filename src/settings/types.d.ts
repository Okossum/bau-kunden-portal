export type Theme = 'light' | 'dark';
export type Container = 'centered' | 'none';

// Mandant (Tenant) Types
export interface MandantAdresse {
  straße?: string;
  plz?: string;
  ort?: string;
  land?: string;
}

export interface MandantFirmenDaten {
  ustIdNr?: string;
  steuernummer?: string;
  handelsregister?: string;
  firmensitz?: string;
  telefon?: string;
  email?: string;
  website?: string;
}

export type MandantTyp = 'firma' | 'privat';

export interface Mandant {
  mandantId: string;
  name: string;
  typ: MandantTyp;
  adresse?: MandantAdresse;
  createdAt: Date;
  firmenDaten?: MandantFirmenDaten;
  aktive?: boolean;
}

export interface CreateMandantRequest {
  name: string;
  typ: MandantTyp;
  adresse?: MandantAdresse;
  firmenDaten?: MandantFirmenDaten;
  aktive?: boolean;
}

export interface UpdateMandantRequest {
  name?: string;
  typ?: MandantTyp;
  adresse?: MandantAdresse;
  firmenDaten?: MandantFirmenDaten;
  aktive?: boolean;
}

// Phase 2: Gewerke und Phasen Types
export interface Gewerk {
  id: string;
  name: string;
  beschreibung?: string;
  kategorie?: string;
  standardDauer?: number; // in Tagen
  abhaengigkeiten?: string[]; // IDs anderer Gewerke
  materialien?: string[];
  handwerker?: string[];
  kosten?: {
    min?: number;
    max?: number;
    einheit?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Phase {
  id: string;
  name: string;
  beschreibung?: string;
  reihenfolge: number;
  gewerke: string[]; // Gewerk-IDs
  standardDauer?: number; // in Tagen
  abhaengigkeiten?: string[]; // IDs anderer Phasen
  status?: 'aktiv' | 'inaktiv';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ProjektGewerk {
  id: string;
  projektId: string;
  gewerkId: string;
  phaseId: string;
  status: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  tatsaechlicherStart?: Date;
  tatsaechlichesEnde?: Date;
  fortschritt: number; // 0-100%
  handwerker?: string[];
  materialien?: string[];
  kosten?: {
    geplant?: number;
    tatsaechlich?: number;
    einheit?: string;
  };
  notizen?: string;
  dokumente?: string[]; // Firebase Storage URLs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ProjektPhase {
  id: string;
  projektId: string;
  phaseId: string;
  status: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  tatsaechlicherStart?: Date;
  tatsaechlichesEnde?: Date;
  fortschritt: number; // 0-100%
  gewerke: string[]; // ProjektGewerk-IDs
  notizen?: string;
  dokumente?: string[]; // Firebase Storage URLs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateGewerkRequest {
  name: string;
  beschreibung?: string;
  kategorie?: string;
  standardDauer?: number;
  abhaengigkeiten?: string[];
  materialien?: string[];
  handwerker?: string[];
  kosten?: {
    min?: number;
    max?: number;
    einheit?: string;
  };
}

export interface UpdateGewerkRequest {
  name?: string;
  beschreibung?: string;
  kategorie?: string;
  standardDauer?: number;
  abhaengigkeiten?: string[];
  materialien?: string[];
  handwerker?: string[];
  kosten?: {
    min?: number;
    max?: number;
    einheit?: string;
  };
}

export interface CreatePhaseRequest {
  name: string;
  beschreibung?: string;
  reihenfolge: number;
  gewerke: string[];
  standardDauer?: number;
  abhaengigkeiten?: string[];
  status?: 'aktiv' | 'inaktiv';
}

export interface UpdatePhaseRequest {
  name?: string;
  beschreibung?: string;
  reihenfolge?: number;
  gewerke?: string[];
  standardDauer?: number;
  abhaengigkeiten?: string[];
  status?: 'aktiv' | 'inaktiv';
}

export interface CreateProjektGewerkRequest {
  projektId: string;
  gewerkId: string;
  phaseId: string;
  status?: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  fortschritt?: number;
  handwerker?: string[];
  materialien?: string[];
  kosten?: {
    geplant?: number;
    tatsaechlich?: number;
    einheit?: string;
  };
  notizen?: string;
}

export interface UpdateProjektGewerkRequest {
  status?: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  tatsaechlicherStart?: Date;
  tatsaechlichesEnde?: Date;
  fortschritt?: number;
  handwerker?: string[];
  materialien?: string[];
  kosten?: {
    geplant?: number;
    tatsaechlich?: number;
    einheit?: string;
  };
  notizen?: string;
}

export interface CreateProjektPhaseRequest {
  projektId: string;
  phaseId: string;
  status?: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  fortschritt?: number;
  notizen?: string;
}

export interface UpdateProjektPhaseRequest {
  status?: 'geplant' | 'in Bearbeitung' | 'abgeschlossen' | 'pausiert' | 'storniert';
  startDatum?: Date;
  endDatum?: Date;
  tatsaechlicherStart?: Date;
  tatsaechlichesEnde?: Date;
  fortschritt?: number;
  notizen?: string;
}

// Phase 3: Bauvorhabenarten und Eigenleistungs-Tracking
export interface Bauvorhabenart {
  id: string;
  name: string;
  beschreibung?: string;
  kategorie?: string;
  status?: 'aktiv' | 'inaktiv';
  standardDauer?: number; // in Tagen
  phasen: string[]; // Phase-IDs
  metadata?: {
    erstelltFuerMandant?: string;
    version?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateBauvorhabenartRequest {
  name: string;
  beschreibung?: string;
  kategorie?: string;
  status?: 'aktiv' | 'inaktiv';
  standardDauer?: number;
  phasen?: string[];
  metadata?: {
    erstelltFuerMandant?: string;
    version?: string;
    tags?: string[];
  };
}

export interface UpdateBauvorhabenartRequest {
  name?: string;
  beschreibung?: string;
  kategorie?: string;
  status?: 'aktiv' | 'inaktiv';
  standardDauer?: number;
  phasen?: string[];
  metadata?: {
    erstelltFuerMandant?: string;
    version?: string;
    tags?: string[];
  };
}

// Erweiterte Gewerk-Interface mit Eigenleistungs-Tracking
export interface GewerkMitEigenleistung extends Gewerk {
  eigenleistung: boolean;
  eigenleistungGeaendertAm?: Date;
  eigenleistungGeaendertVon?: string;
  eigenleistungHistorie?: {
    datum: Date;
    von: string;
    wert: boolean;
    kommentar?: string;
  }[];
}

// Erweiterte Trade-Interface mit Eigenleistungs-Tracking
export interface TradeWithEigenleistung extends TradeWithProgress {
  eigenleistung: boolean;
  eigenleistungGeaendertAm?: Date;
  eigenleistungGeaendertVon?: string;
  eigenleistungHistorie?: {
    datum: Date;
    von: string;
    wert: boolean;
    kommentar?: string;
  }[];
}

// Projekt-Bauvorhabenart Zuordnung
export interface ProjektBauvorhabenart {
  id: string;
  projektId: string;
  bauvorhabenartId: string;
  zugeordnetAm: Date;
  zugeordnetVon: string;
  status: 'aktiv' | 'inaktiv';
  notizen?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjektBauvorhabenartRequest {
  projektId: string;
  bauvorhabenartId: string;
  status?: 'aktiv' | 'inaktiv';
  notizen?: string;
}

export interface UpdateProjektBauvorhabenartRequest {
  status?: 'aktiv' | 'inaktiv';
  notizen?: string;
}
