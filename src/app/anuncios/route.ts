// src/app/api/anuncios/route.ts

import { NextResponse } from 'next/server';
import { allListings } from '@/lib/mockData'; // Importamos os dados

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const setores = searchParams.get('setores')?.split(',');
  const valorMax = searchParams.get('valor_max');
  const localidades = searchParams.get('localidades')?.split(',').map(loc => loc.trim().toLowerCase());

  let filteredListings = allListings;

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

  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json(filteredListings);
}