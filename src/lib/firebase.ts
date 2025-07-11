// src/lib/firebase.ts

// --- SDKS DO CLIENTE (PARA USAR NO NAVEGADOR) ---
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --- SDK ADMIN (PARA USAR NO SERVIDOR - API ROUTES) ---
import * as admin from 'firebase-admin';

// =========================================================================
// INICIALIZAÇÃO PARA O CLIENTE (BROWSER)
// =========================================================================

// A configuração do Firebase lê as variáveis de ambiente do seu arquivo .env.local ou das configurações da Vercel
// O prefixo NEXT_PUBLIC_ é obrigatório para que o Next.js as exponha para o navegador.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lógica para inicializar o app do Firebase de forma segura, evitando erros de reinicialização no Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporte os serviços do Firebase para serem usados em seus componentes e páginas
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };


// =========================================================================
// INICIALIZAÇÃO PARA O SERVIDOR (ADMIN SDK)
// =========================================================================

// As credenciais do Admin SDK devem ser mantidas em segredo absoluto no servidor.
// NUNCA use o prefixo NEXT_PUBLIC_ para elas.
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // A chave privada precisa de um tratamento para substituir o `\n` literal por uma quebra de linha real.
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

/**
 * Retorna uma instância do app Admin do Firebase, inicializando-a se necessário.
 * Use esta função em suas API Routes para operações de backend.
 */
export function getFirebaseAdmin() {
  // O nome 'admin' é um identificador para este app específico, evitando conflitos.
  const adminApp = !admin.apps.some(app => app?.name === 'admin')
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, 'admin')
    : admin.app('admin');

  return {
    adminAuth: adminApp.auth(),
    adminDb: adminApp.firestore(),
    adminStorage: adminApp.storage(),
    adminApp,
  };
}