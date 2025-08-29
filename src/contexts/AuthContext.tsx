// src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  getAuth, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveUserProfile } from '@/lib/firestoreService';

// O nosso tipo de Utilizador agora inclui o perfil completo e a role de admin
interface AppUser extends User {
  name?: string;
  profile?: any;
  isAdmin?: boolean;
}

// O tipo do contexto agora inclui a informação de admin
interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (email: string, pass: string, profileData: any) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authInstance = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let docSnap = await getDoc(userDocRef);

        // ALTERAÇÃO: Se o perfil não existir, cria um básico!
        if (!docSnap.exists()) {
          console.log(`Perfil não encontrado para o utilizador ${firebaseUser.uid}. A criar perfil padrão...`);
          const defaultProfile = { name: firebaseUser.email?.split('@')[0] || 'Novo Utilizador', email: firebaseUser.email };
          await saveUserProfile(firebaseUser.uid, defaultProfile);
          docSnap = await getDoc(userDocRef); // Re-busca o documento recém-criado
        }
        
        const userData = docSnap.data();
        const appUser: AppUser = {
          ...firebaseUser,
          name: userData?.profile?.name || 'Utilizador Anónimo',
          profile: userData?.profile,
          isAdmin: userData?.role === 'admin'
        };

        setUser(appUser);
        setIsAdmin(appUser.isAdmin || false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
    return userCredential.user;
  };

  const signup = async (email: string, pass: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
    const firebaseUser = userCredential.user;
    await saveUserProfile(firebaseUser.uid, profileData);
    return firebaseUser;
  };

  const logout = async () => {
    await signOut(authInstance);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, signup, logout }}>
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