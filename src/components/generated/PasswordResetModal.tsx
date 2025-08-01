import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const { resetPassword } = useAuth();
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Bitte geben Sie eine E-Mail-Adresse ein.');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setResetEmail('');
    setResetSuccess(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        exit={{
          opacity: 0,
          scale: 0.95
        }}
        className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8 w-full max-w-md"
      >
        {/* Header Section */}
        <header className="text-center mb-8">
          <motion.div
            initial={{
              scale: 0.8
            }}
            animate={{
              scale: 1
            }}
            transition={{
              delay: 0.2,
              duration: 0.5
            }}
            className="mb-6"
          >
            {/* MATHI HOFFER Logo */}
            <div className="relative inline-block">
              <img
                className="h-16 w-auto mx-auto mb-4"
                aria-label="MATHI HOFFER Logo"
                style={{
                  height: "108px"
                }}
                src="https://storage.googleapis.com/storage.magicpath.ai/user/295045006568357888/assets/fac56912-1e45-472e-9fff-f03f1766e480.png"
              />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Kundenportal</h1>
          <p className="text-slate-600 text-sm">Ihr Zugang zu Bauprojekten und Dokumenten</p>
        </header>
        {!resetSuccess ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Passwort zurücksetzen</h2>
              <p className="text-slate-600 text-sm">
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                  E-Mail-Adresse
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Ihre E-Mail-Adresse eingeben"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="flex items-center gap-2 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!resetEmail || resetLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Senden...</span>
                    </>
                  ) : (
                    <span>Link senden</span>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">E-Mail gesendet!</h2>
              <p className="text-slate-600 text-sm">
                Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts gesendet.
              </p>
            </div>
            <button
              onClick={handleBackToLogin}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Zurück zum Login
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PasswordResetModal; 