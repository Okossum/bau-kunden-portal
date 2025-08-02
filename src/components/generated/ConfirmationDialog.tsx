import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Key, UserCheck, UserX, X } from 'lucide-react';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Kunde';
  status: 'Aktiv' | 'Inaktiv';
  lastLogin: string;
  projects?: string[];
}
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'delete' | 'reset' | 'toggle';
  user: User | null;
  isLoading?: boolean;
}
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  user,
  isLoading = false
}: ConfirmationDialogProps) {
  if (!user) return null;
  const getDialogConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: Trash2,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          title: 'Benutzer löschen',
          message: `Sind Sie sicher, dass Sie den Benutzer "${user.name}" dauerhaft löschen möchten?`,
          warning: 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten des Benutzers werden unwiderruflich gelöscht.',
          confirmText: 'Löschen',
          confirmStyle: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          cancelText: 'Abbrechen'
        };
      case 'reset':
        return {
          icon: Key,
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-100',
          title: 'Passwort zurücksetzen',
          message: `Möchten Sie das Passwort für "${user.name}" zurücksetzen?`,
          warning: 'Der Benutzer erhält eine E-Mail mit Anweisungen zum Erstellen eines neuen Passworts.',
          confirmText: 'Zurücksetzen',
          confirmStyle: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          cancelText: 'Abbrechen'
        };
      case 'toggle':
        const isActivating = user.status === 'Inaktiv';
        return {
          icon: isActivating ? UserCheck : UserX,
          iconColor: isActivating ? 'text-green-600' : 'text-red-600',
          iconBg: isActivating ? 'bg-green-100' : 'bg-red-100',
          title: isActivating ? 'Benutzer aktivieren' : 'Benutzer deaktivieren',
          message: `Möchten Sie den Benutzer "${user.name}" ${isActivating ? 'aktivieren' : 'deaktivieren'}?`,
          warning: isActivating ? 'Der Benutzer kann sich wieder anmelden und auf zugewiesene Projekte zugreifen.' : 'Der Benutzer kann sich nicht mehr anmelden und verliert den Zugriff auf alle Projekte.',
          confirmText: isActivating ? 'Aktivieren' : 'Deaktivieren',
          confirmStyle: isActivating ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          cancelText: 'Abbrechen'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-slate-600',
          iconBg: 'bg-slate-100',
          title: 'Bestätigung erforderlich',
          message: 'Möchten Sie diese Aktion ausführen?',
          warning: '',
          confirmText: 'Bestätigen',
          confirmStyle: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          cancelText: 'Abbrechen'
        };
    }
  };
  const config = getDialogConfig();
  const Icon = config.icon;
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };
  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={handleCancel} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-start gap-4 p-6 pb-4">
              <div className={`flex-shrink-0 w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {config.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {config.message}
                </p>
              </div>

              <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={handleCancel} disabled={isLoading} className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Warning */}
            {config.warning && <div className="px-6 pb-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {config.warning}
                    </p>
                  </div>
                </div>
              </div>}

            {/* User Info */}
            <div className="px-6 pb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleCancel} disabled={isLoading} className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {config.cancelText}
              </motion.button>
              
              <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleConfirm} disabled={isLoading} className={`px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.confirmStyle}`}>
                {isLoading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Wird ausgeführt...</span>
                  </div> : config.confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}