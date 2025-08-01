import React from 'react';
import { motion } from 'framer-motion';
import SidebarNavigation from './SidebarNavigation';
import ProjectOverviewSection from './ProjectOverviewSection';
import NotificationPanel from './NotificationPanel';
import KPIsPanel from './KPIsPanel';
import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();
  return <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <SidebarNavigation />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.header initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Willkommen, {userData?.displayName || currentUser?.email?.split('@')[0] || 'Benutzer'}
            </h1>
            <p className="text-slate-600 text-base lg:text-lg">
              Hier ist Ihr aktueller Projektüberblick
            </p>
          </motion.header>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Projects and KPIs */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
              <ProjectOverviewSection />
              <KPIsPanel />
            </div>
            
            {/* Right Column - Notifications */}
            <div className="xl:col-span-1">
              <NotificationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default CustomerDashboard;