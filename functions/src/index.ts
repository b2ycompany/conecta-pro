// functions/src/index.ts

// ALTERAÇÃO: Adicionamos esta linha para importar APENAS os tipos do firebase-functions
import type * as functions from "firebase-functions";

// O 'require' continua aqui para o código que será executado (runtime)
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
// Renomeamos a variável para evitar conflito com o 'import type'
const fbFunctions = require("firebase-functions");

admin.initializeApp();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || "";
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY || "";
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || "listings";

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

const functionOptions = {
  secrets: ["ALGOLIA_APP_ID", "ALGOLIA_API_KEY", "ALGOLIA_INDEX_NAME"],
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