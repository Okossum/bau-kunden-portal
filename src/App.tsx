import { useMemo } from 'react';
import { Theme } from './settings/types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { auth } from './lib/firebase';
import SignInPage from './components/generated/SignInPage';
import CustomerDashboard from './components/generated/CustomerDashboard';
import PasswortNeuEingabe from './components/generated/PasswortNeuEingabe';
import TwoFactorAuth from './components/generated/TwoFactorAuth';
import ProtectedRoute from './components/ProtectedRoute';

let theme: Theme = 'light';

function AppContent() {
  const { currentUser, loading, twoFactorRequired, completeTwoFactor } = useAuth();

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

  // If user is authenticated, show dashboard
  if (currentUser) {
    // Show 2FA if required
    if (twoFactorRequired) {
      return (
        <TwoFactorAuth
          email={currentUser.email || ''}
          onSuccess={completeTwoFactor}
          onCancel={() => {
            // Logout bei Abbruch
            auth.signOut();
          }}
        />
      );
    }

    return (
      <ProtectedRoute>
        <CustomerDashboard />
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
