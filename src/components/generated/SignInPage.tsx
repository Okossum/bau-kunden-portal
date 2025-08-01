import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
interface FormData {
  email: string;
  password: string;
  mpid?: string;
}
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
  mpid?: string;
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
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
          general: 'Invalid email or password. Please try again.'
        });
      } else {
        // Success - in real app, redirect would happen here
        console.log('Authentication successful');
      }
    } catch (error) {
      setErrors({
        general: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = formData.email && formData.password && validateEmail(formData.email) && formData.password.length >= 6;
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4" data-magicpath-id="0" data-magicpath-path="SignInPage.tsx">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      ease: "easeOut"
    }} className="w-full max-w-md" data-magicpath-id="1" data-magicpath-path="SignInPage.tsx">
        {/* Header Section */}
        <header className="text-center mb-8" data-magicpath-id="2" data-magicpath-path="SignInPage.tsx">
          <motion.div initial={{
          scale: 0.8
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg" data-magicpath-id="3" data-magicpath-path="SignInPage.tsx">
            <Building2 className="w-8 h-8 text-white" data-magicpath-id="4" data-magicpath-path="SignInPage.tsx" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2" data-magicpath-id="5" data-magicpath-path="SignInPage.tsx">ConstructPro Portal</h1>
          <p className="text-slate-600 text-sm" data-magicpath-id="6" data-magicpath-path="SignInPage.tsx">Professional construction management</p>
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
      }} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8" data-magicpath-id="7" data-magicpath-path="SignInPage.tsx">
          <div className="mb-6" data-magicpath-id="8" data-magicpath-path="SignInPage.tsx">
            <h2 className="text-xl font-semibold text-slate-800 mb-2" data-magicpath-id="9" data-magicpath-path="SignInPage.tsx">Sign In to Your Portal</h2>
            <p className="text-slate-600 text-sm" data-magicpath-id="10" data-magicpath-path="SignInPage.tsx">Access your construction projects and documents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-magicpath-id="11" data-magicpath-path="SignInPage.tsx">
            {/* Email Field */}
            <div className="space-y-2" data-magicpath-id="12" data-magicpath-path="SignInPage.tsx">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700" data-magicpath-id="13" data-magicpath-path="SignInPage.tsx">
                Email Address
              </label>
              <div className="relative" data-magicpath-id="14" data-magicpath-path="SignInPage.tsx">
                <input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="Enter your email address" className={cn("w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.email ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} data-magicpath-id="15" data-magicpath-path="SignInPage.tsx" />
              </div>
              {errors.email && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="flex items-center gap-2 text-red-600 text-sm" data-magicpath-id="16" data-magicpath-path="SignInPage.tsx">
                  <AlertCircle className="w-4 h-4" data-magicpath-id="17" data-magicpath-path="SignInPage.tsx" />
                  <span data-magicpath-id="18" data-magicpath-path="SignInPage.tsx">{errors.email}</span>
                </motion.div>}
            </div>

            {/* Password Field */}
            <div className="space-y-2" data-magicpath-id="19" data-magicpath-path="SignInPage.tsx">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700" data-magicpath-id="20" data-magicpath-path="SignInPage.tsx">
                Password
              </label>
              <div className="relative" data-magicpath-id="21" data-magicpath-path="SignInPage.tsx">
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="Enter your password" className={cn("w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20", errors.password ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-slate-200 bg-slate-50/50 focus:border-blue-300 focus:bg-white")} data-magicpath-id="22" data-magicpath-path="SignInPage.tsx" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" data-magicpath-id="23" data-magicpath-path="SignInPage.tsx">
                  {showPassword ? <EyeOff className="w-5 h-5" data-magicpath-id="24" data-magicpath-path="SignInPage.tsx" /> : <Eye className="w-5 h-5" data-magicpath-id="25" data-magicpath-path="SignInPage.tsx" />}
                </button>
              </div>
              {errors.password && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="flex items-center gap-2 text-red-600 text-sm" data-magicpath-id="26" data-magicpath-path="SignInPage.tsx">
                  <AlertCircle className="w-4 h-4" data-magicpath-id="27" data-magicpath-path="SignInPage.tsx" />
                  <span data-magicpath-id="28" data-magicpath-path="SignInPage.tsx">{errors.password}</span>
                </motion.div>}
            </div>

            {/* General Error Message */}
            {errors.general && <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="p-4 bg-red-50 border border-red-200 rounded-xl" data-magicpath-id="29" data-magicpath-path="SignInPage.tsx">
                <div className="flex items-center gap-3 text-red-700" data-magicpath-id="30" data-magicpath-path="SignInPage.tsx">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" data-magicpath-id="31" data-magicpath-path="SignInPage.tsx" />
                  <span className="text-sm font-medium" data-magicpath-id="32" data-magicpath-path="SignInPage.tsx">{errors.general}</span>
                </div>
              </motion.div>}

            {/* Sign In Button */}
            <motion.button type="submit" disabled={!isFormValid || isLoading} whileHover={isFormValid && !isLoading ? {
            scale: 1.02
          } : {}} whileTap={isFormValid && !isLoading ? {
            scale: 0.98
          } : {}} className={cn("w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2", isFormValid && !isLoading ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl" : "bg-slate-300 cursor-not-allowed")} data-magicpath-id="33" data-magicpath-path="SignInPage.tsx">
              {isLoading ? <>
                  <Loader2 className="w-5 h-5 animate-spin" data-magicpath-id="34" data-magicpath-path="SignInPage.tsx" />
                  <span data-magicpath-id="35" data-magicpath-path="SignInPage.tsx">Signing In...</span>
                </> : <span data-magicpath-id="36" data-magicpath-path="SignInPage.tsx">Sign In</span>}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="text-center" data-magicpath-id="37" data-magicpath-path="SignInPage.tsx">
              <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" onClick={() => console.log('Navigate to forgot password')} data-magicpath-id="38" data-magicpath-path="SignInPage.tsx">
                Forgot your password?
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <footer className="text-center mt-8" data-magicpath-id="39" data-magicpath-path="SignInPage.tsx">
          <p className="text-slate-500 text-xs" data-magicpath-id="40" data-magicpath-path="SignInPage.tsx">
            © 2024 ConstructPro. Secure construction management platform.
          </p>
        </footer>
      </motion.div>
    </div>;
};
export default SignInPage;