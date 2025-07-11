// src/lib/firebase.ts
// ESTE ARQUIVO É PARA O CLIENTE (NAVEGADOR). NÃO COLOQUE O 'firebase-admin' AQUI.

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// A configuração do Firebase lê as variáveis de ambiente que são seguras para o público.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase de forma segura, evitando reinicializações.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporte os serviços para serem usados em seus componentes (Ex: AuthContext, páginas, etc.)
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
