import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Users, 
  Building2,
  LogOut, 
  Menu, 
  X,
  Bug,
  Building,
  Wrench,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  adminOnly?: boolean;
}

interface SidebarNavigationProps {
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
  onNavigateToBauvorhabenartManagement?: () => void;
  onNavigateToEigenleistungReport?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
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
  onNavigateToPhaseManagement,
  onNavigateToBauvorhabenartManagement,
  onNavigateToEigenleistungReport
}) => {
  const { currentUser, userData, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      onClick: onNavigateToDashboard
    },
    {
      id: 'documents',
      label: 'Dokumente',
      icon: <FileText className="w-5 h-5" />,
      onClick: onNavigateToDocuments
    },
    {
      id: 'document-management',
      label: 'Dokumentenverwaltung',
      icon: <FileText className="w-5 h-5" />,
      onClick: onNavigateToDocumentManagement,
      adminOnly: true
    },
    {
      id: 'document-debug',
      label: 'Debug Dokumentenverwaltung',
      icon: <Bug className="w-5 h-5" />,
      onClick: onNavigateToDocumentDebug,
      adminOnly: true
    },
    {
      id: 'simple-debug',
      label: 'Simple Debug',
      icon: <Bug className="w-5 h-5" />,
      onClick: onNavigateToSimpleDebug,
      adminOnly: true
    },
    {
      id: 'test-debug',
      label: '🧪 Test Debug',
      icon: <Bug className="w-5 h-5" />,
      onClick: onNavigateToTestDebug,
      adminOnly: true
    },
    {
      id: 'projects',
      label: 'Projekte',
      icon: <Building2 className="w-5 h-5" />,
      onClick: onNavigateToProjectManagement
    },
    {
      id: 'user-management',
      label: 'Benutzerverwaltung',
      icon: <Users className="w-5 h-5" />,
      onClick: onNavigateToUserManagement,
      adminOnly: true
    },
    {
      id: 'mandant-management',
      label: 'Mandanten-Verwaltung',
      icon: <Building className="w-5 h-5" />,
      onClick: onNavigateToMandantManagement,
      adminOnly: true
    },
    {
      id: 'gewerk-management',
      label: 'Gewerke-Verwaltung',
      icon: <Wrench className="w-5 h-5" />,
      onClick: onNavigateToGewerkManagement,
      adminOnly: true
    },
    {
      id: 'phase-management',
      label: 'Phasen-Verwaltung',
      icon: <Calendar className="w-5 h-5" />,
      onClick: onNavigateToPhaseManagement,
      adminOnly: true
    },
    {
      id: 'bauvorhabenart-management',
      label: 'Bauvorhabenarten',
      icon: <Building className="w-5 h-5" />,
      onClick: onNavigateToBauvorhabenartManagement,
      adminOnly: true
    },
    {
      id: 'eigenleistung-report',
      label: 'Eigenleistungs-Report',
      icon: <BarChart3 className="w-5 h-5" />,
      onClick: onNavigateToEigenleistungReport,
      adminOnly: true
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return userData?.role === 'admin';
    }
    return true;
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMobileMenu} 
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-slate-200" 
        aria-label="Navigation öffnen"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu} />}

      {/* Sidebar */}
      <aside className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Bau-Kunden Portal</h2>
            <p className="text-sm text-slate-600 mt-1">
              {userData?.role === 'admin' ? 'Administrator' : 'Kundenbereich'}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-200">
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-900">
                {userData?.displayName || currentUser?.displayName || currentUser?.email}
              </p>
              <p className="text-xs text-slate-500">
                {userData?.role === 'admin' ? 'Administrator' : 'Benutzer'}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              <span className="font-medium">Abmelden</span>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;