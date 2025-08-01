# Dokumentenverwaltung - Multi-Tenant System

## Übersicht

Dieses System implementiert eine vollständige mandantenfähige Dokumentenverwaltung für das MATHI HOFFER Kundenportal. Jeder Benutzer kann nur seine eigenen Dokumente sehen, hochladen und verwalten.

## Architektur

### Datenstruktur

#### Firestore Collection: `documents`
```typescript
interface DocumentMetadata {
  id?: string;
  filename: string;           // Angezeigter Name
  originalName: string;       // Originaler Dateiname
  description?: string;       // Beschreibung
  fileType: string;          // MIME-Type
  fileSize: number;          // Dateigröße in Bytes
  storageUrl: string;        // Download-URL
  storagePath: string;       // Storage-Pfad
  userId: string;            // Besitzer-ID
  projectId?: string;        // Projekt-Zuordnung (optional)
  tenantId?: string;         // Mandant-ID (für Zukunft)
  uploadedAt: Date;          // Upload-Datum
  updatedAt: Date;           // Letzte Änderung
  tags?: string[];           // Tags für Suche
  isPublic?: boolean;        // Öffentlich sichtbar
  downloadCount?: number;    // Download-Zähler
  lastAccessed?: Date;       // Letzter Zugriff
}
```

#### Firebase Storage Pfad-Struktur
```
documents/
├── {userId}/
│   ├── {timestamp}_{filename}           # Allgemeine Dokumente
│   └── {projectId}/
│       └── {timestamp}_{filename}       # Projekt-spezifische Dokumente
```

### Sicherheitsregeln

#### Firestore Rules (`firestore.rules`)
- **Lesen**: Nur Dokumenteigentümer oder Admin
- **Erstellen**: Authentifizierte Benutzer (nur eigene userId)
- **Aktualisieren**: Dokumenteigentümer oder Admin (keine Besitzeränderung)
- **Löschen**: Dokumenteigentümer oder Admin

#### Storage Rules (`storage.rules`)
- **Lesen**: Dokumenteigentümer, Projektmitglieder oder Admin
- **Schreiben**: Dokumenteigentümer oder Admin
- **Validierung**: Dateigröße (50MB max), Dateitypen
- **Pfad-basierte Sicherheit**: `documents/{userId}/...`

## Komponenten

### 1. DocumentService (`src/services/documentService.ts`)
Hauptservice für alle Dokumentenoperationen:

```typescript
// Dokument hochladen
await DocumentService.uploadDocument(file, userId, description, projectId, tags);

// Benutzer-Dokumente abrufen
const documents = await DocumentService.getUserDocuments(userId, projectId);

// Dokument löschen
await DocumentService.deleteDocument(documentId, userId);

// Dokumente durchsuchen
const results = await DocumentService.searchDocuments(userId, searchTerm, projectId);
```

### 2. DocumentUpload (`src/components/generated/DocumentUpload.tsx`)
Drag & Drop Upload-Komponente mit:
- Dateivalidierung (Größe, Typ)
- Fortschrittsanzeige
- Metadaten-Eingabe (Beschreibung, Tags)
- Responsive Design

### 3. DocumentList (`src/components/generated/DocumentList.tsx`)
Dokumentenliste mit:
- Suche und Filterung
- Sortierung (Name, Datum, Größe)
- Download, Bearbeiten, Löschen
- Dateityp-Icons
- Metadaten-Anzeige

### 4. DocumentManagement (`src/components/generated/DocumentManagement.tsx`)
Hauptseite für Dokumentenverwaltung:
- Tab-Navigation (Liste/Upload)
- Erfolgsmeldungen
- Sicherheitsinformationen

## Installation und Setup

### 1. Firebase-Konfiguration
```bash
# Firestore und Storage initialisieren
firebase init firestore
firebase init storage
```

### 2. Sicherheitsregeln deployen
```bash
# Firestore Rules
firebase deploy --only firestore:rules

# Storage Rules
firebase deploy --only storage
```

### 3. Komponenten einbinden
```typescript
import DocumentManagement from './components/generated/DocumentManagement';

// In Ihrer App
<DocumentManagement projectId="optional-project-id" />
```

## Testanleitung

### 1. Lokale Entwicklung
```bash
# Development Server starten
yarn dev

# Firebase Emulator (optional)
firebase emulators:start
```

### 2. Funktionale Tests

#### A. Dokument hochladen
1. **Login** mit Ihren Credentials
2. **Dokumentenverwaltung** öffnen
3. **"Neues Dokument"** klicken
4. **Datei auswählen** (PDF, Bild, etc.)
5. **Beschreibung und Tags** eingeben
6. **"Dokument hochladen"** klicken
7. **Erfolgsmeldung** prüfen

#### B. Dokumente anzeigen
1. **"Dokumente"** Tab öffnen
2. **Hochgeladenes Dokument** sollte sichtbar sein
3. **Metadaten** prüfen (Größe, Datum, Tags)
4. **Dateityp-Icon** sollte korrekt angezeigt werden

#### C. Dokumente durchsuchen
1. **Suchfeld** verwenden
2. **Nach Dateiname** suchen
3. **Nach Beschreibung** suchen
4. **Nach Tags** suchen
5. **Filter** nach Dateityp testen

#### D. Dokumente verwalten
1. **Download** testen
2. **Löschen** mit Bestätigung
3. **Sortierung** testen (Name, Datum, Größe)

### 3. Sicherheitstests

#### A. Mandantenfähigkeit
1. **Zwei Browser** öffnen
2. **Verschiedene Benutzer** anmelden
3. **Dokumente hochladen** für jeden Benutzer
4. **Prüfen**: Benutzer A sieht nur eigene Dokumente
5. **Prüfen**: Benutzer B sieht nur eigene Dokumente

#### B. Berechtigungstests
1. **Nicht eingeloggter Benutzer** versucht Zugriff
2. **Falsche User-ID** in URL eingeben
3. **Prüfen**: Zugriff verweigert

### 4. Performance-Tests

#### A. Große Dateien
1. **50MB Datei** hochladen
2. **Upload-Fortschritt** beobachten
3. **Download** testen

#### B. Viele Dokumente
1. **10+ Dokumente** hochladen
2. **Liste-Performance** prüfen
3. **Suche-Performance** testen

## Erweiterungen

### 1. Projekt-Integration
```typescript
// Dokumente einem Projekt zuordnen
await DocumentService.uploadDocument(file, userId, description, projectId, tags);

// Projekt-spezifische Dokumente abrufen
const projectDocs = await DocumentService.getUserDocuments(userId, projectId);
```

### 2. Team-Funktionalität
```typescript
// Team-Mitglieder können Dokumente teilen
// Erweitern Sie die Sicherheitsregeln entsprechend
```

### 3. Versionierung
```typescript
// Dokument-Versionen verwalten
// Änderungshistorie implementieren
```

### 4. E-Mail-Benachrichtigungen
```typescript
// Bei Dokument-Upload
// Bei Dokument-Freigabe
// Bei Kommentaren
```

## Troubleshooting

### Häufige Probleme

#### 1. Upload-Fehler
- **Prüfen**: Dateigröße < 50MB
- **Prüfen**: Erlaubter Dateityp
- **Prüfen**: Firebase Storage Rules

#### 2. Zugriffsfehler
- **Prüfen**: Benutzer ist eingeloggt
- **Prüfen**: Firestore Rules sind deployed
- **Prüfen**: Storage Rules sind deployed

#### 3. Performance-Probleme
- **Prüfen**: Dokumente-Index in Firestore
- **Prüfen**: Pagination für große Listen
- **Prüfen**: Caching-Strategien

### Debugging

#### 1. Browser-Konsole
```javascript
// Dokumente abrufen
const docs = await DocumentService.getUserDocuments(userId);
console.log('Documents:', docs);

// Upload testen
const result = await DocumentService.uploadDocument(file, userId);
console.log('Upload result:', result);
```

#### 2. Firebase Console
- **Firestore**: Dokumente in `documents` Collection prüfen
- **Storage**: Dateien in `documents/{userId}/` prüfen
- **Authentication**: Benutzer-Status prüfen

## Best Practices

### 1. Sicherheit
- **Immer** Sicherheitsregeln testen
- **Regelmäßig** Audit der Berechtigungen
- **Sensible Daten** verschlüsseln

### 2. Performance
- **Pagination** für große Listen
- **Lazy Loading** für Bilder
- **Caching** für häufige Abfragen

### 3. Benutzerfreundlichkeit
- **Klare Fehlermeldungen**
- **Upload-Fortschritt** anzeigen
- **Drag & Drop** unterstützen

### 4. Wartung
- **Regelmäßige Backups**
- **Storage-Cleanup** für gelöschte Dateien
- **Monitoring** der Nutzung

## Support

Bei Fragen oder Problemen:
1. **Dokumentation** prüfen
2. **Firebase Console** Logs analysieren
3. **Browser-Konsole** Fehler prüfen
4. **Sicherheitsregeln** validieren 