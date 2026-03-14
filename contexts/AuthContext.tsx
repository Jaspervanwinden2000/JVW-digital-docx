'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  AuthError,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getFirebaseAuth() wordt hier aangeroepen — enkel op de client
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getFirebaseErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Ongeldig e-mailadres of wachtwoord.';
    case 'auth/invalid-email':
      return 'Ongeldig e-mailadres.';
    case 'auth/too-many-requests':
      return 'Te veel pogingen. Probeer later opnieuw.';
    case 'auth/network-request-failed':
      return 'Netwerkfout. Controleer je internetverbinding.';
    case 'auth/popup-closed-by-user':
      return 'Inloggen geannuleerd.';
    default:
      return 'Er is een fout opgetreden. Probeer opnieuw.';
  }
}
