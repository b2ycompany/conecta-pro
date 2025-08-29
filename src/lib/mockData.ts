// src/lib/mockData.ts

// 1. IMPORTAMOS a definição de tipo oficial do nosso ficheiro central 'types.ts'
import type { Listing } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// 2. REMOVEMOS a definição de tipo 'export type Listing' que existia aqui.

// Agora, garantimos que o nosso array de anúncios segue a estrutura oficial e flexível.
// O TypeScript irá avisar-nos se algum campo obrigatório do tipo 'Listing' estiver em falta.
export const allListings: Listing[] = [
  { 
    id: '1', 
    title: 'Cafeteria Charmosa no Centro', 
    sector: 'Restaurantes', 
    price: "250000",
    location: 'Cotia, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
    description: 'Uma cafeteria aconchegante com clientela fiel. Totalmente equipada.',
    annualRevenue: "480000",
    profitMargin: "25",
    employees: "4",
    gallery: [
      'https://images.unsplash.com/photo-1511920183276-542a97fb494d?w=400',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
      'https://images.unsplash.com/photo-1562087926-662f8473a216?w=400'
    ],
    ownerId: 'seller_abc',
    category: 'negocios',
    status: 'approved',
    createdAt: Timestamp.now(),
  },
  { 
    id: '2', 
    title: 'Pizzaria Tradicional de Bairro', 
    sector: 'Restaurantes', 
    price: "180000",
    location: 'Barueri, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
    description: 'Pizzaria com forno a lenha e delivery consolidado na região.',
    annualRevenue: "350000",
    profitMargin: "22",
    employees: "5",
    gallery: [],
    ownerId: 'seller_abc',
    category: 'negocios',
    status: 'approved',
    createdAt: Timestamp.now(),
  },
  // Adicione os outros anúncios aqui seguindo a mesma estrutura...
];