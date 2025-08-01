import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserData, UserService } from '../services/userService';

// Authentication context interface
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Ungültige E-Mail-Adresse oder Passwort. Bitte versuchen Sie es erneut.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Dieses Konto wurde deaktiviert. Bitte kontaktieren Sie den Administrator.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
          break;
        default:
          console.error('Firebase auth error:', authError);
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Logout error:', authError);
      setError('Fehler beim Abmelden. Bitte versuchen Sie es erneut.');
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      
      console.log('Sending password reset email to:', email);
      console.log('Current origin:', window.location.origin);
      
      // Action code settings to redirect to our custom page
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true
      };
      
      console.log('Action code settings:', actionCodeSettings);
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('Password reset email sent successfully');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      
      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/user-not-found':
          errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
          break;
        default:
          console.error('Firebase password reset error:', authError);
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch additional user data
          const userData = await UserService.getUserData(user);
          setUserData(userData);
          
          // Update last login timestamp
          await UserService.updateLastLogin(user.uid);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic user data if fetching fails
          setUserData({
            uid: user.uid,
            email: user.email || '',
            role: 'customer',
            createdAt: new Date(),
            lastLoginAt: new Date()
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    resetPassword,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 