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
  updateDoc
} from 'firebase/firestore';
import type { Listing } from './mockData';

// --- TIPOS DE DADOS PARA MAIOR SEGURANÇA ---

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

type UserProfile = {
    name: string;
};

type UserDocument = {
    profile: UserProfile;
};


// --- FUNÇÕES DE SERVIÇO ---

export const saveListingForUser = async (userId: string, listingId: string, listingTitle: string) => {
  try {
    const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
    await setDoc(listingRef, {
      savedAt: serverTimestamp(),
      title: listingTitle,
    });
  } catch (error) {
    console.error("Erro ao salvar anúncio: ", error);
    throw new Error("Não foi possível salvar o anúncio.");
  }
};

export const removeSavedListing = async (userId: string, listingId: string) => {
  try {
    const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
    await deleteDoc(listingRef);
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
    
    const priceAsNumber = formData.price ? Number(String(formData.price).replace(/\./g, '').replace(',', '.')) : 0;
    const revenueAsNumber = formData.annualRevenue ? Number(String(formData.annualRevenue).replace(/\./g, '').replace(',', '.')) : 0;
    const profitAsNumber = formData.profitMargin ? Number(String(formData.profitMargin).replace(',', '.')) / 100 : 0;
    const employeesAsNumber = Number(formData.employees) || 0;
    const locationString = `${formData.location.address}, ${formData.location.number}${formData.location.complement ? `, ${formData.location.complement}` : ''} - ${formData.location.city}, ${formData.location.state}`;
    
    const dataToSave = {
      listingType: formData.listingType,
      title: formData.title,
      sector: formData.sector,
      location: locationString.trim(),
      price: priceAsNumber,
      description: formData.description,
      imageUrl: formData.imageUrl,
      gallery: formData.gallery,
      annualRevenue: revenueAsNumber,
      profitMargin: profitAsNumber,
      employees: employeesAsNumber,
      monthlyCosts: {
        rent: formData.monthlyCosts.rent ? Number(String(formData.monthlyCosts.rent).replace(/\./g, '').replace(',', '.')) : 0,
        utilities: formData.monthlyCosts.utilities ? Number(String(formData.monthlyCosts.utilities).replace(/\./g, '').replace(',', '.')) : 0,
        payroll: formData.monthlyCosts.payroll ? Number(String(formData.monthlyCosts.payroll).replace(/\./g, '').replace(',', '.')) : 0,
        others: formData.monthlyCosts.others ? Number(String(formData.monthlyCosts.others).replace(/\./g, '').replace(',', '.')) : 0,
      },
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const newListingDocRef = await addDoc(listingsCollectionRef, dataToSave);
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
      console.error("Erro ao excluir anúncio: ", error);
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

export const getEnrichedUserConversas = async (userId: string): Promise<any[]> => {
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, where("participantIds", "array-contains", userId), orderBy("lastMessageTimestamp", "desc"));
    const querySnapshot = await getDocs(q);

    return await Promise.all(querySnapshot.docs.map(async (conversationDoc) => {
        const conversationData = conversationDoc.data();
        const listingId = conversationData.listingId;
        const otherParticipantId = conversationData.participantIds.find((id: string) => id !== userId);

        let listingData: any = { title: 'Anúncio não encontrado', imageUrl: '' };
        if (listingId) {
            const listingDocRef = doc(db, 'listings', listingId);
            const listingSnap = await getDoc(listingDocRef);
            if (listingSnap.exists()) {
                listingData = listingSnap.data();
            }
        }

        let otherUserData: any = { id: otherParticipantId, name: 'Utilizador Removido' };
        if (otherParticipantId) {
            const userDocRef = doc(db, 'users', otherParticipantId);
            const userSnap = await getDoc(userDocRef);
            const userData = userSnap.data() as UserDocument | undefined;
            if (userSnap.exists() && userData?.profile) {
                otherUserData = { id: otherParticipantId, name: userData.profile.name };
            } else {
                otherUserData.name = `Utilizador ${otherParticipantId.substring(0,5)}`;
            }
        }

        return {
            id: conversationDoc.id,
            listing: { id: listingId, title: listingData.title, imageUrl: listingData.imageUrl },
            otherParticipant: otherUserData,
            lastMessage: conversationData.lastMessage,
            lastMessageTimestamp: conversationData.lastMessageTimestamp,
        };
    }));
};