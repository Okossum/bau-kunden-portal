import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Laden...</p>
        </motion.div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    // In a real app, you would use React Router's Navigate component
    // For now, we'll render the login page directly
    return <LoginRedirect />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

// Simple redirect component (in a real app, this would use React Router)
const LoginRedirect: React.FC = () => {
  // For now, we'll just show a message
  // In a real implementation, you would redirect to the login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Zugriff verweigert</h1>
        <p className="text-slate-600 mb-6">
          Sie müssen sich anmelden, um auf diese Seite zuzugreifen.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Zur Anmeldung
        </button>
      </motion.div>
    </div>
  );
};

export default ProtectedRoute; 