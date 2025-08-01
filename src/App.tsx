import { useMemo, useState } from 'react';
import { Theme } from './settings/types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { auth } from './lib/firebase';
import SignInPage from './components/generated/SignInPage';
import CustomerDashboard from './components/generated/CustomerDashboard';
import DocumentPortal from './components/generated/DocumentPortal';
import PasswortNeuEingabe from './components/generated/PasswortNeuEingabe';
import ProtectedRoute from './components/ProtectedRoute';

let theme: Theme = 'light';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'documents'>('dashboard');

  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  // Check if this is a password reset page
  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get('oobCode');
  const mode = urlParams.get('mode');

  // Show password reset page if oobCode is present
  if (oobCode && mode === 'resetPassword') {
    return <PasswortNeuEingabe />;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Laden...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard or documents
  if (currentUser) {
    return (
      <ProtectedRoute>
        {currentView === 'dashboard' ? (
          <CustomerDashboard onNavigateToDocuments={() => setCurrentView('documents')} />
        ) : (
          <DocumentPortal onNavigateToDashboard={() => setCurrentView('dashboard')} />
        )}
      </ProtectedRoute>
    );
  }

  // If user is not authenticated, show login page
  return <SignInPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
