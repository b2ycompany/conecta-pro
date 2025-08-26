// src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, getAuth, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// O nosso tipo de Utilizador agora pode incluir o nome e outros dados do perfil
interface AppUser extends User {
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authInstance = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        // Se o utilizador está logado, buscamos o seu perfil no Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        let appUser: AppUser = firebaseUser;
        if (docSnap.exists()) {
          // Adicionamos os dados do perfil ao nosso objeto de utilizador
          appUser = {
            ...firebaseUser,
            name: docSnap.data().profile?.name || 'Utilizador Anónimo'
          };
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  const logout = async () => {
    await signOut(authInstance);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};