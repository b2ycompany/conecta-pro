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
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { saveUserProfile } from '@/lib/firestoreService';
import type { UserProfile } from '@/lib/types';

interface AppUser extends User {
  name?: string;
  profile?: UserProfile;
  isAdmin?: boolean;
}

// ALTERAÇÃO: Novo tipo para o resultado da função de login
interface LoginResult {
  user: User;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPhoneVerified: boolean;
  // ALTERAÇÃO: O tipo de retorno da função login foi atualizado
  login: (email: string, pass: string) => Promise<LoginResult>;
  signup: (email: string, pass: string, profileData: any) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authInstance = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          const defaultProfile: UserProfile = { 
            name: firebaseUser.email?.split('@')[0] || 'Novo Utilizador', 
            email: firebaseUser.email || '' 
          };
          await saveUserProfile(firebaseUser.uid, defaultProfile);
          docSnap = await getDoc(userDocRef);
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
        setIsPhoneVerified(userData?.profile?.phoneVerified === true);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsPhoneVerified(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  // ALTERAÇÃO: A função login agora é mais inteligente e retorna mais informação
  const login = async (email: string, pass: string): Promise<LoginResult> => {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
    const firebaseUser = userCredential.user;

    // Após o login, vamos ao Firestore verificar o perfil
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userDocRef);

    let userIsAdmin = false;
    if (docSnap.exists()) {
      // Verificamos se a propriedade 'role' no documento é 'admin'
      userIsAdmin = docSnap.data().role === 'admin';
    }

    // Retornamos um objeto com o utilizador e a confirmação de admin
    return { user: firebaseUser, isAdmin: userIsAdmin };
  };

  const signup = async (email: string, pass: string, profileData: any) => {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
    const firebaseUser = userCredential.user;
    const completeProfileData: UserProfile = { ...profileData, email };
    await saveUserProfile(firebaseUser.uid, completeProfileData);
    return firebaseUser;
  };

  const logout = async () => {
    await signOut(authInstance);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isPhoneVerified, login, signup, logout }}>
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