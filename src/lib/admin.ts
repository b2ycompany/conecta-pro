// src/lib/firebase-admin.ts
// ESTE ARQUIVO É SÓ PARA O SERVIDOR (API ROUTES). NUNCA IMPORTE EM COMPONENTES DE CLIENTE.

import * as admin from 'firebase-admin';

// Verifica se o app admin já foi inicializado para evitar erros.
if (!admin.apps.length) {
  // As credenciais do Admin SDK devem ser mantidas em segredo absoluto no servidor.
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // A chave privada precisa de um tratamento para substituir o `\n` literal por uma quebra de linha real.
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Exporta uma instância nomeada para ser usada no seu backend.
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminAuth, adminDb, adminStorage };
