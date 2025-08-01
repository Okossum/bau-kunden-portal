import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
interface FormData {
  email: string;
  password: string;
}
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}
const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
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
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate authentication failure for demo
      if (formData.email !== 'admin@construction.com' || formData.password !== 'password123') {
        setErrors({
          general: 'Ungültige E-Mail-Adresse oder Passwort. Bitte versuchen Sie es erneut.'
        });
      } else {
        // Success - in real app, redirect would happen here
        console.log('Authentication successful');
      }
    } catch (error) {
      setErrors({
        general: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = formData.email && formData.password && validateEmail(formData.email) && formData.password.length >= 6;
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
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

        {/* Login Card */}
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Anmelden</h2>
            <p className="text-slate-600 text-sm">Zugang zu Ihren Bauprojekten und Dokumenten</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="Ihre E-Mail-Adresse eingeben" className={cn("w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.email ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} />
              </div>
              {errors.email && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </motion.div>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Passwort
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="Ihr Passwort eingeben" className={cn("w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.password ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} />
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

            {/* Sign In Button */}
            <motion.button type="submit" disabled={!isFormValid || isLoading} whileHover={isFormValid && !isLoading ? {
            scale: 1.02
          } : {}} whileTap={isFormValid && !isLoading ? {
            scale: 0.98
          } : {}} className={cn("w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2", isFormValid && !isLoading ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl" : "bg-slate-300 cursor-not-allowed")}>
              {isLoading ? <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Anmelden...</span>
                </> : <span>Anmelden</span>}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" onClick={() => console.log('Navigate to forgot password')}>
                Passwort vergessen?
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
    </div>;
};
export default SignInPage;