import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6oRrnh7apuziDVdZfJzRNQMBcVjM9P94",
  authDomain: "bau-kunden-portal.firebaseapp.com",
  projectId: "bau-kunden-portal",
  storageBucket: "bau-kunden-portal.firebasestorage.app",
  messagingSenderId: "602465009236",
  appId: "1:602465009236:web:c2bd15e79828a50afb77c1",
  measurementId: "G-6HVX1QWTC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Connect to auth emulator in development (optional)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app; 