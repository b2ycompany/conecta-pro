// src/lib/types.ts
import { Timestamp } from "firebase/firestore";

export type ListingLocation = {
  cep: string; address: string; number: string; complement?: string; city: string; state: string;
};

export type Listing = {
  // --- Campos Obrigatórios para TODOS os anúncios ---
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  location: ListingLocation | string;
  imageUrl: string;
  ownerId: string;
  createdAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';

  // --- Campos Opcionais (podem ou não existir) ---
  gallery?: string[];
  sector?: string;
  annualRevenue?: string;
  profitMargin?: string;
  employees?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  condition?: 'Novo' | 'Usado';
  size?: string;

  // Permite outros campos que não listamos explicitamente
  [key: string]: any;
};

export type CategorySuggestion = {
  id: string;
  categoryName: string;
  description: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
};

// NOVO TIPO ADICIONADO
export type ModerationMessage = {
  id: string;
  text: string;
  senderId: string; // O UID do Admin
  senderName: string; // Ex: "Administração"
  createdAt: Timestamp;
  isRead: boolean;
};