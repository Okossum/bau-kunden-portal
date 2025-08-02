# Projektverwaltung - Bauprojekt-Management System

## Übersicht

Das Projektverwaltungssystem ermöglicht die vollständige Erfassung, Verwaltung und Überwachung von Bauprojekten in einem mandantenfähigen System. Jeder Benutzer kann nur Projekte seines eigenen Mandanten sehen und verwalten.

## Architektur

### Datenstruktur

#### Firestore Collection: `projekte`
```typescript
interface Project {
  id?: string;
  projectName: string;           // Projektname/Titel
  projectId: string;            // Eindeutige Projekt-ID
  constructionTypes: string[];  // Bauvorhaben/Bauart (Mehrfachauswahl)
  status: 'geplant' | 'in Bau' | 'abgeschlossen' | 'pausiert' | 'storniert';
  description?: string;         // Projektbeschreibung
  tenantId: string;            // Mandantenfähigkeit
  clientId: string;            // Kunden-Referenz
  address: ProjectAddress;     // Projektadresse
  plannedStartDate: Date;      // Geplanter Baubeginn
  plannedEndDate: Date;        // Geplantes Bauende
  actualEndDate?: Date;        // Aktuelles Bauende
  client: Client;              // Bauherr/Auftraggeber Details
  responsibleUserId: string;   // Projektverantwortlicher
  notes?: string;              // Notizen/Kommentare
  attachments?: string[];      // Firebase Storage URLs
  createdAt: Date;             // Erstellungsdatum
  updatedAt: Date;             // Letzte Änderung
  createdBy: string;           // Erstellt von
  updatedBy: string;           // Geändert von
}

interface ProjectAddress {
  street: string;
  zipCode: string;
  city: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface Client {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
}
```

### Sicherheitsregeln

#### Firestore Rules (`firestore.rules`)
- **Lesen**: Nur Projekte des eigenen Mandanten oder Admin
- **Erstellen**: Authentifizierte Benutzer (nur für eigenen Mandanten)
- **Aktualisieren**: Mandanten-Eigentümer oder Admin
- **Löschen**: Mandanten-Eigentümer oder Admin

## Komponenten

### 1. ProjectService (`src/services/projectService.ts`)
**Zentrale Service-Klasse für alle Projekt-Operationen:**

#### Funktionen:
- `getProjectsByTenant(tenantId)` - Projekte nach Mandant laden
- `getProjectById(projectId)` - Einzelnes Projekt laden
- `createProject(projectData)` - Neues Projekt erstellen
- `updateProject(projectId, projectData, updatedBy)` - Projekt aktualisieren
- `deleteProject(projectId)` - Projekt löschen
- `isProjectIdUnique(projectId, tenantId)` - Eindeutigkeit prüfen
- `searchProjects(tenantId, searchTerm)` - Projekte suchen

### 2. ProjectForm (`src/components/generated/ProjectForm.tsx`)
**Umfassendes Formular für Projekterfassung und -bearbeitung:**

#### Features:
- ✅ **Alle erforderlichen Felder** mit Validierung
- ✅ **Mehrfachauswahl** für Bauvorhaben/Bauart
- ✅ **Mandantenfähige Kundenauswahl**
- ✅ **Strukturierte Adresserfassung**
- ✅ **Datumsvalidierung** (Bauende nach Baubeginn)
- ✅ **E-Mail-Validierung**
- ✅ **Eindeutige Projekt-ID-Prüfung**
- ✅ **Responsive Design** mit moderner UI

#### Validierung:
- **Pflichtfelder**: Projektname, Projekt-ID, Bauart, Status, Mandant, Baubeginn, Bauende, Verantwortlicher
- **Datumslogik**: Bauende muss nach Baubeginn liegen
- **E-Mail-Format**: Gültige E-Mail-Adressen
- **Projekt-ID**: Eindeutigkeit innerhalb des Mandanten

### 3. ProjectManagementPage (`src/components/generated/ProjectManagementPage.tsx`)
**Hauptseite für Projektverwaltung:**

#### Features:
- ✅ **Projektübersicht** in Karten-Ansicht
- ✅ **Suche** nach Projektname, ID, Beschreibung, Kunde
- ✅ **Status-Filter** (geplant, in Bau, abgeschlossen, etc.)
- ✅ **CRUD-Operationen** (Erstellen, Bearbeiten, Löschen)
- ✅ **Status-Anzeige** mit Farbkodierung und Icons
- ✅ **Responsive Grid-Layout**
- ✅ **Lade- und Fehlerzustände**

## Verwendung

### 1. Projekt erstellen
1. **Navigation**: Klicken Sie auf "Projekte" in der Sidebar
2. **Neues Projekt**: Klicken Sie auf "Neues Projekt"
3. **Formular ausfüllen**:
   - **Grundinformationen**: Name, ID, Bauart, Status, Beschreibung
   - **Kunde und Verantwortliche**: Mandant und Projektverantwortlicher
   - **Adresse**: Vollständige Projektadresse
   - **Zeitplan**: Geplante Start- und Enddaten
   - **Bauherr-Details**: Kontaktinformationen
   - **Notizen**: Zusätzliche Kommentare
4. **Speichern**: Klicken Sie auf "Projekt erstellen"

### 2. Projekt bearbeiten
1. **Projekt auswählen**: Klicken Sie auf das Bearbeiten-Icon (Stift)
2. **Änderungen vornehmen**: Alle Felder sind editierbar
3. **Speichern**: Klicken Sie auf "Änderungen speichern"

### 3. Projekt löschen
1. **Projekt auswählen**: Klicken Sie auf das Löschen-Icon (Papierkorb)
2. **Bestätigung**: Bestätigen Sie die Löschung
3. **Entfernung**: Projekt wird aus der Liste entfernt

### 4. Projekte suchen und filtern
1. **Suche**: Geben Sie Suchbegriffe in das Suchfeld ein
2. **Status-Filter**: Wählen Sie einen Status aus dem Dropdown
3. **Aktualisieren**: Klicken Sie auf "Aktualisieren" für die neuesten Daten

## Technische Details

### Firebase Integration
- **Firestore**: Projektdaten und Metadaten
- **Security Rules**: Mandantenbasierte Zugriffskontrolle
- **Indexes**: Optimierte Abfragen für Suche und Filterung

### React/TypeScript Features
- **TypeScript**: Vollständige Typsicherheit
- **React Hooks**: useState, useEffect für State-Management
- **Framer Motion**: Smooth Animationen und Übergänge
- **Responsive Design**: Mobile-first Ansatz

### Validierung und Fehlerbehandlung
- **Client-seitige Validierung**: Sofortige Rückmeldung
- **Server-seitige Validierung**: Firestore Security Rules
- **Fehlerbehandlung**: Benutzerfreundliche Fehlermeldungen
- **Loading States**: Ladeindikatoren für bessere UX

## Sicherheit

### Mandantenfähigkeit
- **Tenant-ID**: Jedes Projekt ist einem Mandanten zugeordnet
- **Zugriffskontrolle**: Benutzer sehen nur Projekte ihres Mandanten
- **Isolation**: Vollständige Datenisolation zwischen Mandanten

### Firestore Security Rules
```javascript
// Projekte Collection
match /projekte/{projectId} {
  // Lesen: Admin oder Mandanten-Eigentümer
  allow read: if isAuthenticated() && 
    (isAdmin() || resource.data.tenantId == request.auth.uid);
  
  // Erstellen: Authentifiziert und für eigenen Mandanten
  allow create: if isAuthenticated() && 
    request.resource.data.tenantId == request.auth.uid;
  
  // Aktualisieren: Admin oder Mandanten-Eigentümer
  allow update: if isAuthenticated() && 
    (isAdmin() || resource.data.tenantId == request.auth.uid);
  
  // Löschen: Admin oder Mandanten-Eigentümer
  allow delete: if isAuthenticated() && 
    (isAdmin() || resource.data.tenantId == request.auth.uid);
}
```

## Erweiterte Features

### Geplante Erweiterungen
- **Datei-Upload**: Projektbilder und Dokumente
- **Zeitplan-Management**: Detaillierte Meilensteine
- **Team-Zuordnung**: Mehrere Verantwortliche pro Projekt
- **Reporting**: Projektstatistiken und Berichte
- **E-Mail-Benachrichtigungen**: Statusänderungen
- **Kalender-Integration**: Projekttermine

### Performance-Optimierungen
- **Pagination**: Große Projektlisten
- **Caching**: Häufig abgerufene Daten
- **Lazy Loading**: Bilder und Dokumente
- **Search Indexing**: Optimierte Suchfunktionen

## Best Practices

### Datenmodellierung
- **Normalisierung**: Vermeidung von Datenredundanz
- **Referenzen**: Verwendung von Firestore-Referenzen
- **Timestamps**: Automatische Erstellungs- und Änderungsdaten
- **Audit Trail**: Nachverfolgung von Änderungen

### UI/UX
- **Konsistenz**: Einheitliches Design-System
- **Zugänglichkeit**: WCAG-konforme Implementierung
- **Performance**: Optimierte Rendering-Performance
- **Mobile-First**: Responsive Design für alle Geräte

### Code-Qualität
- **TypeScript**: Strenge Typsicherheit
- **Komponenten-Struktur**: Wiederverwendbare Komponenten
- **Error Boundaries**: Robuste Fehlerbehandlung
- **Testing**: Unit- und Integration-Tests

## Troubleshooting

### Häufige Probleme

#### 1. Projekt-ID bereits vergeben
**Problem**: Fehler beim Erstellen eines Projekts
**Lösung**: Verwenden Sie eine eindeutige Projekt-ID

#### 2. Keine Projekte sichtbar
**Problem**: Leere Projektliste
**Lösung**: Überprüfen Sie die Mandanten-Zuordnung

#### 3. Validierungsfehler
**Problem**: Formular kann nicht gespeichert werden
**Lösung**: Überprüfen Sie alle Pflichtfelder und Validierungen

#### 4. Firestore-Fehler
**Problem**: Datenbankzugriffsfehler
**Lösung**: Überprüfen Sie die Security Rules und Berechtigungen

### Debugging
- **Browser-Konsole**: JavaScript-Fehler und Logs
- **Firebase Console**: Firestore-Abfragen und Security Rules
- **Network Tab**: API-Aufrufe und Antworten
- **React DevTools**: Komponenten-State und Props

## Fazit

Das Projektverwaltungssystem bietet eine vollständige Lösung für die Verwaltung von Bauprojekten mit:

- ✅ **Vollständige CRUD-Funktionalität**
- ✅ **Mandantenfähige Architektur**
- ✅ **Moderne, responsive UI**
- ✅ **Robuste Validierung**
- ✅ **Sichere Datenhaltung**
- ✅ **Erweiterbare Struktur**

Das System ist produktionsreif und kann sofort verwendet werden. 