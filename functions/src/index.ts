// functions/src/index.ts

// Adicionamos esta linha para importar APENAS os tipos do firebase-functions
import type * as functions from "firebase-functions";

// Os 'require' continuam aqui para o código que será executado (runtime)
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const fbFunctions = require("firebase-functions");
const stripe = require("stripe"); // Adicionamos a biblioteca do Stripe

admin.initializeApp();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || "";
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY || "";
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || "listings";

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

// ALTERAÇÃO: Adicionamos os segredos do Stripe
const functionOptions = {
  secrets: [
    "ALGOLIA_APP_ID",
    "ALGOLIA_API_KEY",
    "ALGOLIA_INDEX_NAME",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
};

/**
 * Trigger executado quando um novo anúncio é criado no Firestore.
 */
exports.onListingCreated = fbFunctions.runWith(functionOptions).firestore
  .document("listings/{listingId}")
  .onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot) => {
    const listingData = snapshot.data();
    const objectID = snapshot.id;

    try {
      const algoliaRecord = { ...listingData, objectID: objectID };
      await index.saveObject(algoliaRecord);
      fbFunctions.logger.log(`Anúncio ${objectID} adicionado ao Algolia.`);
    } catch (error) {
      fbFunctions.logger.error(
        `Erro ao adicionar o anúncio ${objectID} ao Algolia:`, error,
      );
    }
  });

/**
 * Trigger executado quando um anúncio é atualizado no Firestore.
 */
exports.onListingUpdated = fbFunctions.runWith(functionOptions).firestore
  .document("listings/{listingId}")
  .onUpdate(async (change: functions.Change<functions.firestore.QueryDocumentSnapshot>) => {
    const newData = change.after.data();
    const objectID = change.after.id;

    try {
      const algoliaRecord = { ...newData, objectID: objectID };
      await index.saveObject(algoliaRecord);
      fbFunctions.logger.log(`Anúncio ${objectID} atualizado no Algolia.`);
    } catch (error) {
      fbFunctions.logger.error(
        `Erro ao atualizar o anúncio ${objectID} no Algolia:`, error,
      );
    }
  });

/**
 * Trigger executado quando um anúncio é excluído no Firestore.
 */
exports.onListingDeleted = fbFunctions.runWith(functionOptions).firestore
  .document("listings/{listingId}")
  .onDelete(async (snapshot: functions.firestore.QueryDocumentSnapshot) => {
    const objectID = snapshot.id;

    try {
      await index.deleteObject(objectID);
      fbFunctions.logger.log(`Anúncio ${objectID} removido do Algolia.`);
    } catch (error) {
      fbFunctions.logger.error(
        `Erro ao remover o anúncio ${objectID} do Algolia:`, error,
      );
    }
  });


// NOVA CLOUD FUNCTION: Webhook para o Stripe
exports.stripeWebhook = fbFunctions.runWith(functionOptions).https.onRequest(async (req: any, res: any) => {
  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Verifica se o pedido veio realmente do Stripe usando a assinatura do webhook
    event = stripeClient.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err: any) {
    fbFunctions.logger.error("Webhook signature verification failed.", err.message);
    return res.sendStatus(400); // Responde com erro se a assinatura for inválida
  }

  // Lida com o evento 'checkout.session.completed' que ocorre quando um pagamento é finalizado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listingId = session.metadata.listingId; // Recupera o ID do anúncio que passamos ao criar a sessão

    if (!listingId) {
      fbFunctions.logger.error("Erro: listingId não encontrado nos metadados da sessão Stripe.");
      return res.status(400).send("listingId não encontrado nos metadados.");
    }

    try {
      const listingRef = admin.firestore().collection("listings").doc(listingId);
      
      // Calcula a data de expiração do destaque (7 dias a partir de agora)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      // Atualiza o documento do anúncio no Firestore
      await listingRef.update({
        isFeatured: true,
        featuredUntil: admin.firestore.Timestamp.fromDate(sevenDaysFromNow),
      });

      fbFunctions.logger.log(`Anúncio ${listingId} destacado com sucesso até ${sevenDaysFromNow.toISOString()}.`);
    } catch (error) {
      fbFunctions.logger.error(`Erro ao destacar o anúncio ${listingId}:`, error);
      return res.status(500).send("Erro interno ao atualizar o anúncio.");
    }
  }

  res.status(200).send(); // Envia uma resposta de sucesso para o Stripe
});