// src/lib/types.ts
import { Timestamp } from "firebase/firestore";

// NOVO TIPO ADICIONADO E EXPORTADO
export type UserProfile = {
  name: string;
  email: string;
  profileType?: string;
  document?: string;
  phone?: string;
  // CAMPOS DE VERIFICAÇÃO ADICIONADOS
  phoneVerified?: boolean;
  phoneNumber?: string; // Para guardar o número que foi verificado
};

export type ListingLocation = {
  cep: string;
  address: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
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

  // --- CAMPOS ADICIONADOS PARA MONETIZAÇÃO ---
  isFeatured?: boolean;
  featuredUntil?: Timestamp;

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

export type ModerationMessage = {
  id: string;
  text: string;
  senderId: string; // O UID do Admin
  senderName: string; // Ex: "Administração"
  createdAt: Timestamp;
  isRead: boolean;
};