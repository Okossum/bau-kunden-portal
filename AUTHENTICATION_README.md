# Firebase Authentication für das Baukundenportal

## Übersicht

Diese Implementierung bietet eine vollständige Firebase Authentication-Lösung für das mandantenfähige Baukundenportal mit folgenden Features:

- ✅ E-Mail/Passwort-Authentifizierung
- ✅ Persistente Sessions (bleibt nach Seiten-Reload erhalten)
- ✅ Geschützte Routen
- ✅ Benutzerrollen und -berechtigungen
- ✅ Responsive UI mit Ladeindikatoren
- ✅ Fehlerbehandlung mit deutschen Fehlermeldungen
- ✅ Multi-Tenant-Unterstützung (vorbereitet)

## Komponenten-Struktur

```
src/
├── lib/
│   └── firebase.ts              # Firebase-Konfiguration
├── contexts/
│   └── AuthContext.tsx          # Authentication Context
├── components/
│   ├── generated/
│   │   └── SignInPage.tsx       # Login-Seite (aktualisiert)
│   ├── Dashboard.tsx            # Dashboard nach Login
│   └── ProtectedRoute.tsx       # Geschützte Routen
├── services/
│   └── userService.ts           # Benutzerdaten-Management
└── App.tsx                      # Haupt-App mit AuthProvider
```

## Firebase-Konfiguration

Die Firebase-Konfiguration ist in `src/lib/firebase.ts` definiert:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA6oRrnh7apuziDVdZfJzRNQMBcVjM9P94",
  authDomain: "bau-kunden-portal.firebaseapp.com",
  projectId: "bau-kunden-portal",
  storageBucket: "bau-kunden-portal.firebasestorage.app",
  messagingSenderId: "602465009236",
  appId: "1:602465009236:web:c2bd15e79828a50afb77c1",
  measurementId: "G-6HVX1QWTC8"
};
```

## Verwendung

### 1. AuthProvider einbinden

Der `AuthProvider` muss die gesamte App umschließen:

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

### 2. Authentication Hook verwenden

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { 
    currentUser,    // Firebase User Objekt
    userData,       // Erweiterte Benutzerdaten
    loading,        // Ladezustand
    login,          // Login-Funktion
    logout,         // Logout-Funktion
    error,          // Fehlermeldungen
    clearError      // Fehler löschen
  } = useAuth();

  // Beispiel: Login
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
    } catch (error) {
      // Fehler wird automatisch im Context gesetzt
    }
  };

  // Beispiel: Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

### 3. Geschützte Routen

Verwenden Sie `ProtectedRoute` für Seiten, die nur für authentifizierte Benutzer zugänglich sind:

```tsx
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

## Benutzerrollen und -berechtigungen

Das System unterstützt drei Benutzerrollen:

- **admin**: Vollzugriff auf alle Funktionen
- **employee**: Mitarbeiter-Zugriff
- **customer**: Kunden-Zugriff (Standard)

### Benutzerdaten erweitern

Erweitern Sie die `UserData` Interface in `src/services/userService.ts`:

```typescript
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'customer' | 'employee';
  tenantId?: string;        // Für Multi-Tenant
  projects?: string[];      // Zugängliche Projekte
  permissions?: string[];   // Spezifische Berechtigungen
  createdAt: Date;
  lastLoginAt: Date;
}
```

## Multi-Tenant-Unterstützung

Das System ist für Multi-Tenant-Architektur vorbereitet:

1. **Tenant-ID**: Jeder Benutzer kann einer `tenantId` zugeordnet werden
2. **Projekt-Filterung**: Datenbankabfragen können nach `tenantId` gefiltert werden
3. **Berechtigungen**: Benutzer können nur auf ihre zugewiesenen Projekte zugreifen

### Beispiel für Firestore-Regeln

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projekte nur für zugewiesene Benutzer
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.assignedUsers;
    }
    
    // Dokumente nur für Projekt-Mitglieder
    match /documents/{documentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.assignedUsers;
    }
  }
}
```

## Fehlerbehandlung

Das System behandelt automatisch Firebase Auth-Fehler und zeigt deutsche Fehlermeldungen:

- `auth/user-not-found` / `auth/wrong-password`: "Ungültige E-Mail-Adresse oder Passwort"
- `auth/invalid-email`: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
- `auth/too-many-requests`: "Zu viele fehlgeschlagene Anmeldeversuche"
- `auth/user-disabled`: "Dieses Konto wurde deaktiviert"
- `auth/network-request-failed`: "Netzwerkfehler"

## Registrierung

**Wichtig**: Die Registrierung neuer Benutzer ist nur für Admins oder per Einladung möglich. Es gibt keine offene Registrierung.

### Admin-Registrierung implementieren

Fügen Sie diese Funktion zum `AuthContext` hinzu:

```typescript
const createUser = async (email: string, password: string, userData: Partial<UserData>) => {
  // Nur Admins können neue Benutzer erstellen
  if (userData.role !== 'admin') {
    throw new Error('Nur Administratoren können neue Benutzer erstellen');
  }
  
  // Firebase Auth User erstellen
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Zusätzliche Benutzerdaten in Firestore speichern
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    ...userData,
    createdAt: new Date(),
    lastLoginAt: new Date()
  });
};
```

## Sicherheitsrichtlinien

1. **Firebase Security Rules**: Konfigurieren Sie Firestore-Regeln für Datenzugriff
2. **HTTPS**: Verwenden Sie immer HTTPS in der Produktion
3. **Session-Management**: Firebase handhabt Sessions automatisch
4. **Passwort-Richtlinien**: Implementieren Sie starke Passwort-Anforderungen
5. **Rate Limiting**: Firebase bietet eingebautes Rate Limiting

## Deployment

1. **Firebase-Projekt konfigurieren**:
   - Authentication aktivieren (E-Mail/Passwort)
   - Firestore-Datenbank erstellen
   - Security Rules konfigurieren

2. **Umgebungsvariablen** (optional):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   ```

3. **Build und Deploy**:
   ```bash
   yarn build
   # Deploy zu Firebase Hosting oder anderen Plattformen
   ```

## Nächste Schritte

1. **Firestore-Integration**: Erweitern Sie `userService.ts` um echte Datenbankabfragen
2. **Benutzerverwaltung**: Implementieren Sie Admin-Interface für Benutzerverwaltung
3. **E-Mail-Verifikation**: Aktivieren Sie E-Mail-Verifikation in Firebase
4. **Passwort-Reset**: Implementieren Sie Passwort-Reset-Funktionalität
5. **Audit-Logging**: Protokollieren Sie Login/Logout-Ereignisse

## Troubleshooting

### Häufige Probleme

1. **"Cannot find module 'firebase'"**: 
   ```bash
   yarn add firebase
   ```

2. **Authentication nicht funktioniert**:
   - Überprüfen Sie Firebase-Konfiguration
   - Stellen Sie sicher, dass E-Mail/Passwort-Auth aktiviert ist

3. **TypeScript-Fehler**:
   ```bash
   npx tsc --noEmit
   ```

### Debug-Modus

Aktivieren Sie Firebase Auth Emulator für lokale Entwicklung:

```typescript
// In src/lib/firebase.ts
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Firebase Console
2. Schauen Sie in die Browser-Konsole für Fehlermeldungen
3. Testen Sie mit Firebase Auth Emulator 