import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AdminService } from '../../services/adminService';

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AdminService.createAdminUser(
        'admin@mathi-hoffer.de',
        'AdminUser123!',
        'Mathi Hoffer Administrator'
      );
      
      setSuccess(true);
      console.log('✅ Admin-User erfolgreich erstellt!');
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Fehler beim Erstellen des Admin-Users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const isAdmin = await AdminService.testAdminLogin('admin@mathi-hoffer.de', 'AdminUser123!');
      
      if (isAdmin) {
        setSuccess(true);
        setError(null);
        console.log('✅ Admin-Login erfolgreich getestet!');
      } else {
        setError('Admin-Login fehlgeschlagen oder User ist kein Admin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Admin-User Setup
            </h1>
            <p className="text-slate-600">
              Erstellen Sie den Administrator-Account für das Baukundenportal
            </p>
          </div>

          {/* Admin Credentials */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-3">Admin-Zugangsdaten:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">E-Mail:</span>
                <span className="ml-2 text-slate-600">admin@mathi-hoffer.de</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Passwort:</span>
                <span className="ml-2 text-slate-600">AdminUser123!</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800 font-medium">
                  Admin-User erfolgreich erstellt!
                </span>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Erstelle Admin-User...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Admin-User erstellen</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Teste Login...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Login testen</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Anweisungen:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Klicken Sie auf "Admin-User erstellen"</li>
              <li>Warten Sie auf die Bestätigung</li>
              <li>Testen Sie den Login mit den angegebenen Zugangsdaten</li>
              <li>Löschen Sie diese Seite nach erfolgreicher Erstellung</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup; 