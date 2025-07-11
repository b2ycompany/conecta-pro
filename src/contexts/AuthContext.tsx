// src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoaderCircle } from 'lucide-react';

// Adicionamos as funções de login/logout ao nosso tipo
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Nossas funções de autenticação
  const signup = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  }

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const logout = () => {
    return signOut(auth);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-background">
        <LoaderCircle size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}