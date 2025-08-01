import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import TwoFactorService from '../../services/twoFactorService';

interface TwoFactorAuthProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ email, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 Minuten in Sekunden
  const [showCode, setShowCode] = useState(false);

  // Timer für Code-Gültigkeit
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Der Code ist abgelaufen. Bitte fordern Sie einen neuen Code an.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time left as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Automatisch Code senden beim ersten Laden
  useEffect(() => {
    sendCode();
  }, []);

  const sendCode = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      const twoFactorCode = TwoFactorService.createCode(email);
      const result = await TwoFactorService.sendCodeEmail(email, twoFactorCode.code);
      
      if (result.success) {
        setSuccess('Code erfolgreich gesendet!');
        setTimeLeft(600); // Reset timer
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Fehler beim Senden des Codes. Bitte versuchen Sie es erneut.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Bitte geben Sie den 6-stelligen Code ein.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = TwoFactorService.validateCode(email, code);
      
      if (result.valid) {
        setSuccess('Code erfolgreich validiert!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    // Nur Zahlen erlauben und auf 6 Zeichen begrenzen
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* 2FA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8"
        >
          {/* Header Section */}
          <header className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              {/* MATHI HOFFER Logo */}
              <div className="relative inline-block">
                <img
                  className="h-16 w-auto mx-auto mb-4"
                  aria-label="MATHI HOFFER Logo"
                  style={{ height: "108px" }}
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/295045006568357888/assets/fac56912-1e45-472e-9fff-f03f1766e480.png"
                />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Zwei-Faktor-Authentifizierung</h1>
            <p className="text-slate-600 text-sm">Sicherheitscode eingeben</p>
          </header>

          {/* Info Text */}
          <div className="mb-6 text-center">
            <p className="text-slate-700 text-sm mb-2">
              Wir haben einen 6-stelligen Sicherheitscode an
            </p>
            <p className="text-slate-800 font-medium">{email}</p>
            <p className="text-slate-600 text-xs mt-2">
              Der Code ist {formatTime(timeLeft)} gültig
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-slate-700">
                Sicherheitscode
              </label>
              <div className="relative">
                <input
                  id="code"
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="000000"
                  className={cn(
                    "w-full px-4 py-3 pr-12 text-center text-2xl font-mono tracking-widest rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    error
                      ? "border-red-300 bg-red-50/50 focus:border-red-400"
                      : "border-slate-300 bg-white focus:border-blue-400 text-slate-900 placeholder-slate-400"
                  )}
                  maxLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-center gap-3 text-green-700">
                  <span className="text-sm font-medium">{success}</span>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={code.length !== 6 || isLoading || timeLeft === 0}
              whileHover={code.length === 6 && !isLoading && timeLeft > 0 ? { scale: 1.02 } : {}}
              whileTap={code.length === 6 && !isLoading && timeLeft > 0 ? { scale: 0.98 } : {}}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2",
                code.length === 6 && !isLoading && timeLeft > 0
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Überprüfe...</span>
                </>
              ) : (
                <span>Code bestätigen</span>
              )}
            </motion.button>

            {/* Resend Code Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={sendCode}
                disabled={isResending || timeLeft > 0}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2 mx-auto",
                  isResending || timeLeft > 0
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sende...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Code erneut senden</span>
                  </>
                )}
              </button>
            </div>

            {/* Cancel Button */}
            <div className="text-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-600 hover:text-slate-700 text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TwoFactorAuth; 