import { useMemo, useState } from 'react';
import { Theme } from './settings/types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { auth } from './lib/firebase';
import SignInPage from './components/generated/SignInPage';
import CustomerDashboard from './components/generated/CustomerDashboard';
import DocumentPortal from './components/generated/DocumentPortal';
import DocumentManagementPage from './components/generated/DocumentManagementPage';
import DocumentManagementDebug from './components/generated/DocumentManagementDebug';
import SimpleDebug from './components/generated/SimpleDebug';
import TestDebug from './components/generated/TestDebug';
import { UserManagementPage } from './components/generated/UserManagementPage';
import ProjectManagementPage from './components/generated/ProjectManagementPage';
import ProjectProgressPage from './components/generated/ProjectProgressPage';
import PasswortNeuEingabe from './components/generated/PasswortNeuEingabe';
import AdminSetup from './components/generated/AdminSetup';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarNavigation from './components/generated/SidebarNavigation';
import AppLayout from './components/generated/AppLayout';
import MandantManagementPage from './components/generated/MandantManagementPage';
import GewerkManagementPage from './components/generated/GewerkManagementPage';
import PhaseManagementPage from './components/generated/PhaseManagementPage';
import BauvorhabenartManagementPage from './components/generated/BauvorhabenartManagementPage';
import EigenleistungReportPage from './components/generated/EigenleistungReportPage';

let theme: Theme = 'light';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'documents' | 'document-management' | 'document-debug' | 'simple-debug' | 'test-debug' | 'user-management' | 'project-management' | 'project-progress' | 'mandant-management' | 'gewerk-management' | 'phase-management' | 'bauvorhabenart-management' | 'eigenleistung-report'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  // Set theme based on user preference
  useMemo(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      theme = savedTheme;
    }
  }, []);

  // Check for URL parameters for password reset and admin setup
  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get('oobCode');
  const mode = urlParams.get('mode');
  const adminSetup = urlParams.get('admin-setup');

  // Show password reset page if oobCode is present
  if (oobCode && mode === 'resetPassword') {
    return <PasswortNeuEingabe />;
  }

  // Show admin setup if requested via URL parameter or button
  if (showAdminSetup || adminSetup === 'true') {
    return <AdminSetup />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  // Navigation handlers
  const handleNavigateToDashboard = () => setCurrentView('dashboard');
  const handleNavigateToDocuments = () => setCurrentView('documents');
  const handleNavigateToDocumentManagement = () => setCurrentView('document-management');
  const handleNavigateToDocumentDebug = () => setCurrentView('document-debug');
  const handleNavigateToSimpleDebug = () => setCurrentView('simple-debug');
  const handleNavigateToTestDebug = () => setCurrentView('test-debug');
  const handleNavigateToUserManagement = () => setCurrentView('user-management');
  const handleNavigateToProjectManagement = () => setCurrentView('project-management');
  const handleNavigateToMandantManagement = () => setCurrentView('mandant-management');
  const handleNavigateToGewerkManagement = () => setCurrentView('gewerk-management');
  const handleNavigateToPhaseManagement = () => setCurrentView('phase-management');
  const handleNavigateToBauvorhabenartManagement = () => setCurrentView('bauvorhabenart-management');
  const handleNavigateToEigenleistungReport = () => setCurrentView('eigenleistung-report');
  const handleNavigateToProjectProgress = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-progress');
  };

  // Helper function to get common navigation props
  const getCommonNavigationProps = () => ({
    onNavigateToDashboard: handleNavigateToDashboard,
    onNavigateToDocuments: handleNavigateToDocuments,
    onNavigateToDocumentManagement: handleNavigateToDocumentManagement,
    onNavigateToDocumentDebug: handleNavigateToDocumentDebug,
    onNavigateToSimpleDebug: handleNavigateToSimpleDebug,
    onNavigateToTestDebug: handleNavigateToTestDebug,
    onNavigateToUserManagement: handleNavigateToUserManagement,
    onNavigateToProjectManagement: handleNavigateToProjectManagement,
    onNavigateToMandantManagement: handleNavigateToMandantManagement,
    onNavigateToGewerkManagement: handleNavigateToGewerkManagement,
    onNavigateToPhaseManagement: handleNavigateToPhaseManagement,
    onNavigateToBauvorhabenartManagement: handleNavigateToBauvorhabenartManagement,
    onNavigateToEigenleistungReport: handleNavigateToEigenleistungReport
  });

  // If user is authenticated, show appropriate view
  if (currentUser) {

    switch (currentView) {
      case 'dashboard':
        return (
          <AppLayout
            {...getCommonNavigationProps()}
          >
            <CustomerDashboard
              onNavigateToDocuments={handleNavigateToDocuments}
              onNavigateToDocumentManagement={handleNavigateToDocumentManagement}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToProjectManagement={handleNavigateToProjectManagement}
              onNavigateToProjectProgress={handleNavigateToProjectProgress}
            />
          </AppLayout>
        );
      case 'documents':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <DocumentPortal
              onNavigateToDashboard={handleNavigateToDashboard}
            />
          </AppLayout>
        );
      case 'document-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <DocumentManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
              onNavigateToProjectManagement={handleNavigateToProjectManagement}
            />
          </AppLayout>
        );
      case 'document-debug':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <DocumentManagementDebug />
          </AppLayout>
        );
      case 'simple-debug':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <SimpleDebug />
          </AppLayout>
        );
      case 'test-debug':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <TestDebug />
          </AppLayout>
        );
      case 'user-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <UserManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
              onNavigateToDocuments={handleNavigateToDocuments}
              onNavigateToProjectManagement={handleNavigateToProjectManagement}
            />
          </AppLayout>
        );
      case 'project-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <ProjectManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToProjectProgress={handleNavigateToProjectProgress}
            />
          </AppLayout>
        );
      case 'project-progress':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <ProjectProgressPage
              projectId={selectedProjectId}
              onNavigateToDashboard={handleNavigateToDashboard}
              onNavigateToProjectManagement={handleNavigateToProjectManagement}
            />
          </AppLayout>
        );
      case 'mandant-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <MandantManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
            />
          </AppLayout>
        );
      case 'gewerk-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <GewerkManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
            />
          </AppLayout>
        );
      case 'phase-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <PhaseManagementPage
              onNavigateToDashboard={handleNavigateToDashboard}
            />
          </AppLayout>
        );
      case 'bauvorhabenart-management':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <BauvorhabenartManagementPage />
          </AppLayout>
        );
      case 'eigenleistung-report':
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <EigenleistungReportPage />
          </AppLayout>
        );
      default:
        return (
          <AppLayout {...getCommonNavigationProps()}>
            <CustomerDashboard
              onNavigateToDocuments={handleNavigateToDocuments}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToProjectManagement={handleNavigateToProjectManagement}
              onNavigateToProjectProgress={handleNavigateToProjectProgress}
            />
          </AppLayout>
        );
    }
  }

  // Show sign-in page if user is not authenticated
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
