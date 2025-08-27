// src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  getAuth, 
  User,
  createUserWithEmailAndPassword, // Importamos a função de signup
  signInWithEmailAndPassword    // Importamos a função de login
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveUserProfile } from '@/lib/firestoreService'; // Importamos a nossa função de salvar perfil

// O nosso tipo de Utilizador agora pode incluir o nome e outros dados do perfil
interface AppUser extends User {
  name?: string;
}

// O tipo do contexto agora inclui as funções de login e signup
interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (email: string, pass: string, profileData: any) => Promise<User>;
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
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        let appUser: AppUser = firebaseUser;
        if (docSnap.exists()) {
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

  // --- NOVA FUNÇÃO DE LOGIN ---
  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
    return userCredential.user;
  };

  // --- NOVA FUNÇÃO DE SIGNUP ---
  const signup = async (email: string, pass: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
    const firebaseUser = userCredential.user;
    // Após criar o utilizador, salvamos os dados do perfil no Firestore
    await saveUserProfile(firebaseUser.uid, profileData);
    return firebaseUser;
  };

  const logout = async () => {
    await signOut(authInstance);
  };

  return (
    // Adicionamos as novas funções ao valor do provider
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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