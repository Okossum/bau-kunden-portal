import React from 'react';
import SidebarNavigation from './SidebarNavigation';
import DebugSidebar from './DebugSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onNavigateToDashboard?: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToDocumentManagement?: () => void;
  onNavigateToDocumentDebug?: () => void;
  onNavigateToSimpleDebug?: () => void;
  onNavigateToTestDebug?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToProjectManagement?: () => void;
  onNavigateToMandantManagement?: () => void;
  onNavigateToGewerkManagement?: () => void;
  onNavigateToPhaseManagement?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = React.memo(({
  children,
  onNavigateToDashboard,
  onNavigateToDocuments,
  onNavigateToDocumentManagement,
  onNavigateToDocumentDebug,
  onNavigateToSimpleDebug,
  onNavigateToTestDebug,
  onNavigateToUserManagement,
  onNavigateToProjectManagement,
  onNavigateToMandantManagement,
  onNavigateToGewerkManagement,
  onNavigateToPhaseManagement
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DebugSidebar componentName="SidebarNavigation">
        <SidebarNavigation
          onNavigateToDashboard={onNavigateToDashboard}
          onNavigateToDocuments={onNavigateToDocuments}
          onNavigateToDocumentManagement={onNavigateToDocumentManagement}
          onNavigateToDocumentDebug={onNavigateToDocumentDebug}
          onNavigateToSimpleDebug={onNavigateToSimpleDebug}
          onNavigateToTestDebug={onNavigateToTestDebug}
          onNavigateToUserManagement={onNavigateToUserManagement}
          onNavigateToProjectManagement={onNavigateToProjectManagement}
                  onNavigateToMandantManagement={onNavigateToMandantManagement}
        onNavigateToGewerkManagement={onNavigateToGewerkManagement}
        onNavigateToPhaseManagement={onNavigateToPhaseManagement}
        />
      </DebugSidebar>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
});

export default AppLayout; 