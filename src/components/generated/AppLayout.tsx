import React from 'react';
import SidebarNavigation from './SidebarNavigation';


interface AppLayoutProps {
  children: React.ReactNode;
  onNavigateToDashboard?: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToDocumentManagement?: () => void;

  onNavigateToUserManagement?: () => void;
  onNavigateToProjectManagement?: () => void;
  onNavigateToMandantManagement?: () => void;
  onNavigateToGewerkManagement?: () => void;
  onNavigateToPhaseManagement?: () => void;
  onNavigateToBauvorhabenartManagement?: () => void;
  onNavigateToEigenleistungReport?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = React.memo(({
  children,
  onNavigateToDashboard,
  onNavigateToDocuments,
  onNavigateToDocumentManagement,

  onNavigateToUserManagement,
  onNavigateToProjectManagement,
  onNavigateToMandantManagement,
  onNavigateToGewerkManagement,
  onNavigateToPhaseManagement,
  onNavigateToBauvorhabenartManagement,
  onNavigateToEigenleistungReport
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
              <SidebarNavigation
          onNavigateToDashboard={onNavigateToDashboard}
          onNavigateToDocuments={onNavigateToDocuments}
          onNavigateToDocumentManagement={onNavigateToDocumentManagement}
          onNavigateToUserManagement={onNavigateToUserManagement}
          onNavigateToProjectManagement={onNavigateToProjectManagement}
          onNavigateToMandantManagement={onNavigateToMandantManagement}
          onNavigateToGewerkManagement={onNavigateToGewerkManagement}
          onNavigateToPhaseManagement={onNavigateToPhaseManagement}
          onNavigateToBauvorhabenartManagement={onNavigateToBauvorhabenartManagement}
          onNavigateToEigenleistungReport={onNavigateToEigenleistungReport}
        />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
});

export default AppLayout; 