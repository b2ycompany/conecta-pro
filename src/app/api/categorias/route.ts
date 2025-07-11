// src/app/api/categorias/route.ts

import { NextResponse } from 'next/server';

// Por enquanto, usaremos dados estáticos. No futuro, isto virá do Firestore.
const approvedCategories = [
  { id: '1', name: 'Restaurantes' },
  { id: '2', name: 'Tecnologia' },
  { id: '3', name: 'Varejo' },
  { id: '4', name: 'Saúde & Bem-estar' },
  { id: '5', name: 'Educação' },
  { id: '6', name: 'Serviços Automotivos' },
  { id: '7', name: 'Indústria Leve' },
  { id: '8', name: 'Beleza & Estética' },
  { id: '9', name: 'Agronegócio' },
  { id: '10', name: 'Commodities' } // Incluindo a sua sugestão
];

export async function GET(request: Request) {
  // No futuro, aqui teríamos a lógica para buscar dados do Firebase.
  // ex: const categories = await db.collection('categorias').where('status', '==', 'aprovado').get();
  
  // Adicionamos um pequeno delay para simular uma chamada de rede real
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(approvedCategories);
}