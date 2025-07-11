// src/app/api/anuncios/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Importamos a nossa instância do DB
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Listing } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pegamos os filtros da URL
    const setores = searchParams.get('setores')?.split(',');
    const valorMax = searchParams.get('valor_max');
    const localidades = searchParams.get('localidades')?.split(',').map(loc => loc.trim().toLowerCase());

    // Buscamos os dados da coleção 'listings' no Firestore
    const listingsCollectionRef = collection(db, 'listings');
    const querySnapshot = await getDocs(listingsCollectionRef);

    let allListings: Listing[] = [];
    querySnapshot.forEach(doc => {
        allListings.push({ id: doc.id, ...doc.data() } as Listing);
    });

    let filteredListings = allListings;

    // A lógica de filtro continua a mesma, mas agora sobre os dados reais
    if (valorMax) {
        filteredListings = filteredListings.filter(listing => listing.price <= Number(valorMax));
    }
    if (setores && setores[0] !== '') {
        filteredListings = filteredListings.filter(listing => setores.includes(listing.sector));
    }
    if (localidades && localidades[0] !== '') {
        filteredListings = filteredListings.filter(listing => 
            localidades.some(loc => listing.location.toLowerCase().includes(loc))
        );
    }

    return NextResponse.json(filteredListings);

  } catch (error) {
    console.error("Erro ao buscar anúncios do Firestore:", error);
    return NextResponse.json({ message: "Erro ao buscar anúncios." }, { status: 500 });
  }
}