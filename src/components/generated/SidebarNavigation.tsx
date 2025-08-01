import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, FolderOpen, FileText, Calendar, HelpCircle, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  active?: boolean;
  onClick?: () => void;
}
interface SidebarNavigationProps {
  onNavigateToDocuments?: () => void;
  onNavigateToDashboard?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  onNavigateToDocuments, 
  onNavigateToDashboard 
}) => {
  const { currentUser, userData, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems: NavItem[] = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    active: true,
    onClick: onNavigateToDashboard
  }, {
    id: 'projects',
    label: 'Projekte',
    icon: FolderOpen
  }, {
    id: 'documents',
    label: 'Dokumente',
    icon: FileText,
    onClick: onNavigateToDocuments
  }, {
    id: 'calendar',
    label: 'Termine',
    icon: Calendar
  }, {
    id: 'support',
    label: 'Support',
    icon: HelpCircle
  }];
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
  return <>
      {/* Mobile Menu Button */}
      <button onClick={toggleMobileMenu} className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-slate-200" aria-label="Navigation öffnen">
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
              Kundenbereich
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
              const Icon = item.icon;
              return <li key={item.id}>
                    <motion.button initial={{
                  opacity: 0,
                  x: -20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.3,
                  delay: index * 0.1
                }} className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        text-left transition-all duration-200
                        ${item.active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}
                      `} onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        }
                      }}>
                      <Icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  </li>;
            })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {userData?.displayName || currentUser?.email?.split('@')[0] || 'Benutzer'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                  {userData?.role && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">
                      {userData.role === 'admin' ? 'Administrator' : 
                       userData.role === 'employee' ? 'Mitarbeiter' : 'Kunde'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-2">
                Benötigen Sie Hilfe?
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Kontakt aufnehmen
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>;
};
export default SidebarNavigation;