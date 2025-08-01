import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const PasswordResetPage: React.FC = () => {
  const { clearError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(true);
  const [oobCode, setOobCode] = useState<string>('');

  // Get oobCode from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    if (code) {
      setOobCode(code);
      validateResetCode(code);
    } else {
      setErrors({ general: 'Ungültiger oder abgelaufener Reset-Link.' });
      setIsValidatingCode(false);
    }
  }, []);

  const validateResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setIsValidatingCode(false);
    } catch (error) {
      console.error('Invalid reset code:', error);
      setErrors({ general: 'Ungültiger oder abgelaufener Reset-Link.' });
      setIsValidatingCode(false);
    }
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear general error when user modifies form
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await confirmPasswordReset(auth, oobCode, formData.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      switch (error.code) {
        case 'auth/expired-action-code':
          errorMessage = 'Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen Link an.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'Ungültiger Reset-Link. Bitte fordern Sie einen neuen Link an.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.';
          break;
        default:
          console.error('Firebase password reset error:', error);
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.password && formData.confirmPassword && 
                     validatePassword(formData.password) && 
                     formData.password === formData.confirmPassword;

  if (isValidatingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Überprüfe Reset-Link...</p>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          ease: "easeOut"
        }} className="w-full max-w-md">
          {/* Success Card */}
          <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.3,
            duration: 0.5
          }} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8">
            {/* Header Section */}
            <header className="text-center mb-8">
              <motion.div initial={{
                scale: 0.8
              }} animate={{
                scale: 1
              }} transition={{
                delay: 0.2,
                duration: 0.5
              }} className="mb-6">
                {/* MATHI HOFFER Logo */}
                <div className="relative inline-block">
                  <img className="h-16 w-auto mx-auto mb-4" aria-label="MATHI HOFFER Logo" style={{
                    height: "108px"
                  }} src="https://storage.googleapis.com/storage.magicpath.ai/user/295045006568357888/assets/fac56912-1e45-472e-9fff-f03f1766e480.png" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Kundenportal</h1>
              <p className="text-slate-600 text-sm">Ihr Zugang zu Bauprojekten und Dokumenten</p>
            </header>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Passwort erfolgreich geändert!
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Zur Anmeldung
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="text-center mt-8">
            <p className="text-slate-500 text-xs">
              © 2024 MATHI HOFFER. Sicheres Baukundenportal.
            </p>
          </footer>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        ease: "easeOut"
      }} className="w-full max-w-md">
        {/* Reset Card */}
        <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3,
          duration: 0.5
        }} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8">
          {/* Header Section */}
          <header className="text-center mb-8">
            <motion.div initial={{
              scale: 0.8
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.2,
              duration: 0.5
            }} className="mb-6">
              {/* MATHI HOFFER Logo */}
              <div className="relative inline-block">
                <img className="h-16 w-auto mx-auto mb-4" aria-label="MATHI HOFFER Logo" style={{
                  height: "108px"
                }} src="https://storage.googleapis.com/storage.magicpath.ai/user/295045006568357888/assets/fac56912-1e45-472e-9fff-f03f1766e480.png" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Kundenportal</h1>
            <p className="text-slate-600 text-sm">Ihr Zugang zu Bauprojekten und Dokumenten</p>
          </header>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Passwort zurücksetzen</h2>
            <p className="text-slate-600 text-sm">Wählen Sie ein neues, sicheres Passwort</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Neues Passwort
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="Neues Passwort eingeben" className={cn("w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.password ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </motion.div>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Passwort bestätigen
              </label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} placeholder="Passwort wiederholen" className={cn("w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.confirmPassword ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </motion.div>}
            </div>

            {/* General Error Message */}
            {errors.general && <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{errors.general}</span>
                </div>
              </motion.div>}

            {/* Reset Button */}
            <motion.button type="submit" disabled={!isFormValid || isLoading} whileHover={isFormValid && !isLoading ? {
              scale: 1.02
            } : {}} whileTap={isFormValid && !isLoading ? {
              scale: 0.98
            } : {}} className={cn("w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2", isFormValid && !isLoading ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl" : "bg-slate-300 cursor-not-allowed")}>
              {isLoading ? <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Passwort ändern...</span>
                </> : <span>Passwort ändern</span>}
            </motion.button>

            {/* Back to Login Link */}
            <div className="text-center">
              <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" onClick={() => window.location.href = '/'}>
                Zurück zur Anmeldung
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            © 2024 MATHI HOFFER. Sicheres Baukundenportal.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default PasswordResetPage; 