// src/lib/firestoreService.ts

import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  updateDoc,
  runTransaction,
  limit,
  writeBatch
} from 'firebase/firestore';
import type { Listing, CategorySuggestion, ModerationMessage, UserProfile } from './types';

export type SavedListingInfo = {
  id: string;
  title: string;
};

export type ConversationInfo = {
    id: string;
    listingId: string;
    lastMessage: string;
    lastMessageTimestamp: any;
    participantIds: string[];
};

type UserDocument = { 
  profile: UserProfile; 
  reviewCount?: number; 
  averageRating?: number;
};

export type EnrichedConversation = {
  id: string;
  listing: {
    id: string;
    title: string;
    imageUrl: string;
  };
  otherParticipant: {
    id: string;
    name: string;
  };
  lastMessage: string;
  lastMessageTimestamp: any;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  listingId: string;
  createdAt: any;
};

export const saveListingForUser = async (userId: string, listingId: string, listingTitle: string) => {
  try {
    const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
    await setDoc(listingRef, {
      savedAt: serverTimestamp(),
      title: listingTitle,
    });
    console.log("Anúncio salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar anúncio: ", error);
    throw new Error("Não foi possível salvar o anúncio.");
  }
};

export const removeSavedListing = async (userId: string, listingId: string) => {
  try {
    const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
    await deleteDoc(listingRef);
    console.log("Anúncio removido com sucesso!");
  } catch (error) {
    console.error("Erro ao remover anúncio: ", error);
    throw new Error("Não foi possível remover o anúncio.");
  }
};

export const isListingSaved = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
    const docSnap = await getDoc(listingRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Erro ao verificar anúncio salvo: ", error);
    return false;
  }
};

export const getUserSavedListings = async (userId: string): Promise<SavedListingInfo[]> => {
  try {
    const savedListingsRef = collection(db, 'users', userId, 'savedListings');
    const q = query(savedListingsRef, orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(snapshot => ({
      id: snapshot.id,
      title: snapshot.data().title,
    }));
  } catch (error) {
    console.error("Erro ao buscar anúncios salvos: ", error);
    return [];
  }
};

export const createListing = async (userId: string, formData: any) => {
    try {
      const listingsCollectionRef = collection(db, 'listings');
      
      const dataToSave = {
        ...formData,
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      };
  
      const newListingDocRef = await addDoc(listingsCollectionRef, dataToSave);
      console.log("Novo anúncio criado com o ID: ", newListingDocRef.id);
      return newListingDocRef.id;
    } catch (error) {
      console.error("Erro ao criar anúncio: ", error);
      throw new Error("Não foi possível publicar o seu anúncio.");
    }
};

export const getListingForEdit = async (listingId: string) => {
    try {
      const listingRef = doc(db, 'listings', listingId);
      const docSnap = await getDoc(listingRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Listing;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar anúncio para edição:", error);
      throw error;
    }
};

export const updateListing = async (listingId: string, dataToUpdate: any) => {
    try {
        const listingRef = doc(db, 'listings', listingId);
        await updateDoc(listingRef, { ...dataToUpdate, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Erro ao atualizar anúncio:", error);
        throw new Error("Não foi possível atualizar o anúncio.");
    }
};

export const deleteListing = async (listingId: string) => {
    try {
      const listingRef = doc(db, 'listings', listingId);
      await deleteDoc(listingRef);
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      throw new Error("Não foi possível excluir o anúncio.");
    }
};

export const getOrCreateConversation = async (listingId: string, ownerId: string, buyerId: string): Promise<string> => {
    const conversationId = ownerId > buyerId ? `${listingId}_${buyerId}_${ownerId}` : `${listingId}_${ownerId}_${buyerId}`;
    const conversationDocRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(conversationDocRef);
    if (docSnap.exists()) return docSnap.id;
    await setDoc(conversationDocRef, {
        listingId: listingId,
        participantIds: [ownerId, buyerId],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTimestamp: serverTimestamp(),
    });
    return conversationId;
};
  
export const sendMessage = async (conversationId: string, senderId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesRef, { senderId, text, timestamp: serverTimestamp() });
      const conversationRef = doc(db, 'conversations', conversationId);
      await setDoc(conversationRef, { lastMessage: text, lastMessageTimestamp: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw new Error("Não foi possível enviar a mensagem.");
    }
};

export const saveUserProfile = async (userId: string, profileData: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { profile: profileData, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar perfil do utilizador: ", error);
    throw new Error("Não foi possível salvar os dados do perfil.");
  }
};

export const getUserConversas = async (userId: string): Promise<ConversationInfo[]> => {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, where('participantIds', 'array-contains', userId), orderBy('lastMessageTimestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() } as ConversationInfo));
    } catch (error) {
      console.error("Erro ao buscar conversas: ", error);
      return [];
    }
};

export const getUserCreatedListings = async (userId: string): Promise<Listing[]> => {
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() } as Listing));
    } catch (error) {
      console.error("Erro ao buscar anúncios criados: ", error);
      return [];
    }
};

export const getEnrichedUserConversas = async (userId: string): Promise<EnrichedConversation[]> => {
    try {
        const conversationsRef = collection(db, "conversations");
        const q = query(conversationsRef, where("participantIds", "array-contains", userId), orderBy("lastMessageTimestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const enrichedConversations = await Promise.all(querySnapshot.docs.map(async (conversationDoc) => {
            const conversationData = conversationDoc.data();
            const listingId = conversationData.listingId;
            const otherParticipantId = conversationData.participantIds.find((id: string) => id !== userId);

            const [listingSnap, userSnap] = await Promise.all([
                listingId ? getDoc(doc(db, 'listings', listingId)) : Promise.resolve(null),
                otherParticipantId ? getDoc(doc(db, 'users', otherParticipantId)) : Promise.resolve(null)
            ]);

            const listingData = listingSnap?.exists() ? listingSnap.data() : { title: 'Anúncio Removido', imageUrl: '/placeholder.png' };
            
            const userData = userSnap?.exists() ? (userSnap.data() as UserDocument) : null;
            const otherUserName = userData?.profile?.name || `Utilizador Anónimo`;

            return {
                id: conversationDoc.id,
                listing: { id: listingId, title: listingData.title, imageUrl: listingData.imageUrl },
                otherParticipant: { id: otherParticipantId, name: otherUserName },
                lastMessage: conversationData.lastMessage,
                lastMessageTimestamp: conversationData.lastMessageTimestamp,
            } as EnrichedConversation;
        }));

        return enrichedConversations;
    } catch (error) {
        console.error("Erro ao enriquecer conversas: ", error);
        return [];
    }
};

export const getUserProfile = async (userId: string): Promise<UserDocument | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserDocument;
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar perfil do utilizador: ", error);
        return null;
    }
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
    try {
        const reviewsRef = collection(db, 'users', userId, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() } as Review));
    } catch (error) {
        console.error("Erro ao buscar avaliações: ", error);
        return [];
    }
};

export const submitReviewAndRecalculateAverage = async (
    reviewedUserId: string, 
    reviewData: {
        rating: number;
        comment: string;
        reviewerId: string;
        reviewerName: string;
        listingId: string;
    }
) => {
    const userRef = doc(db, 'users', reviewedUserId);
    const reviewRef = doc(collection(userRef, 'reviews'));

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) { throw "Documento do utilizador não existe!"; }
            transaction.set(reviewRef, { ...reviewData, createdAt: serverTimestamp() });
            const currentReviewCount = userDoc.data().reviewCount || 0;
            const currentAverageRating = userDoc.data().averageRating || 0;
            const newReviewCount = currentReviewCount + 1;
            const newAverageRating = ((currentAverageRating * currentReviewCount) + reviewData.rating) / newReviewCount;
            transaction.update(userRef, { 
                reviewCount: newReviewCount,
                averageRating: newAverageRating
            });
        });
        console.log("Avaliação submetida e média recalculada com sucesso!");
    } catch (error) {
        console.error("Erro na transação de avaliação: ", error);
        throw new Error("Não foi possível submeter a avaliação.");
    }
};

export const getRecentListings = async (count: number = 8): Promise<Listing[]> => {
    try {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, 
            where('status', '==', 'approved'), 
            orderBy('createdAt', 'desc'), 
            limit(count)
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Listing));
    } catch (error) {
        console.error("Erro ao buscar anúncios recentes: ", error);
        return [];
    }
};

export const getListingsByCategory = async (categoryId: string): Promise<Listing[]> => {
    try {
        const listingsRef = collection(db, 'listings');
        const q = query(
            listingsRef, 
            where('category', '==', categoryId),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Listing));
    } catch (error) {
        console.error(`Erro ao buscar anúncios para a categoria ${categoryId}: `, error);
        return [];
    }
};

export const getPendingListings = async (): Promise<Listing[]> => {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
  } catch (error) {
    console.error("Erro ao buscar anúncios pendentes: ", error);
    return [];
  }
};

export const updateListingStatus = async (listingId: string, newStatus: 'approved' | 'rejected') => {
  try {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, { status: newStatus, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Erro ao atualizar status do anúncio: ", error);
    throw new Error("Não foi possível atualizar o status.");
  }
};

export const submitCategorySuggestion = async (data: { categoryName: string; description: string; userId: string; userName: string; }) => {
  try {
    const suggestionsRef = collection(db, 'category_suggestions');
    await addDoc(suggestionsRef, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao submeter sugestão de categoria: ", error);
    throw new Error("Não foi possível enviar a sua sugestão.");
  }
};

export const getPendingCategorySuggestions = async (): Promise<CategorySuggestion[]> => {
  try {
    const suggestionsRef = collection(db, 'category_suggestions');
    const q = query(suggestionsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategorySuggestion));
  } catch (error) {
    console.error("Erro ao buscar sugestões de categoria pendentes: ", error);
    return [];
  }
};

export const updateCategorySuggestionStatus = async (suggestionId: string, newStatus: 'approved' | 'rejected') => {
  try {
    const suggestionRef = doc(db, 'category_suggestions', suggestionId);
    await updateDoc(suggestionRef, { status: newStatus });
  } catch (error) {
    console.error("Erro ao atualizar status da sugestão: ", error);
    throw new Error("Não foi possível atualizar o status da sugestão.");
  }
};

export const rejectListingWithMessage = async (
  listingId: string,
  adminId: string,
  message: string
) => {
  try {
    const batch = writeBatch(db);
    const listingRef = doc(db, 'listings', listingId);
    batch.update(listingRef, { status: 'rejected', updatedAt: serverTimestamp() });
    const messageRef = doc(collection(listingRef, 'moderationMessages'));
    batch.set(messageRef, {
      text: message,
      senderId: adminId,
      senderName: 'Administração',
      createdAt: serverTimestamp(),
      isRead: false,
    });
    await batch.commit();
  } catch (error) {
    console.error("Erro ao rejeitar anúncio com mensagem: ", error);
    throw new Error("Não foi possível rejeitar o anúncio.");
  }
};

export const getModerationMessages = async (listingId: string): Promise<ModerationMessage[]> => {
  try {
    const messagesRef = collection(db, 'listings', listingId, 'moderationMessages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModerationMessage));
  } catch (error) {
    console.error("Erro ao buscar mensagens de moderação: ", error);
    return [];
  }
};

// --- NOVA FUNÇÃO PARA VERIFICAÇÃO DE TELEMÓVEL ---
/**
 * Atualiza o perfil de um utilizador para marcar o seu telemóvel como verificado.
 * @param userId O ID do utilizador a ser atualizado.
 * @param phoneNumber O número de telemóvel que foi verificado.
 */
export const updateUserPhoneVerification = async (userId: string, phoneNumber: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    // Usamos 'updateDoc' para adicionar/modificar campos sem sobrescrever o perfil inteiro
    // A notação "profile.phoneVerified" atualiza um campo dentro de um objeto (mapa) no Firestore.
    await updateDoc(userRef, {
      "profile.phoneVerified": true,
      "profile.phoneNumber": phoneNumber,
      "updatedAt": serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao atualizar status de verificação do utilizador: ", error);
    throw new Error("Não foi possível atualizar o perfil com o status de verificação.");
  }
};