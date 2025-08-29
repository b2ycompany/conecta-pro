// src/app/api/anuncios/route.ts

import { NextResponse } from 'next/server';
import { allListings } from '@/lib/mockData';
import { parseCurrency } from '@/lib/formatters';
import type { Listing } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const setores = searchParams.get('setores')?.split(',');
  const valorMax = searchParams.get('valor_max');
  const localidades = searchParams.get('localidades')?.split(',').map(loc => loc.trim().toLowerCase());

  let filteredListings: Listing[] = allListings;

  // Filtro por Valor Máximo
  if (valorMax) {
    const valorMaxNumber = Number(valorMax);
    if (!isNaN(valorMaxNumber)) {
      // Lógica 100% corrigida para o filtro de preço
      filteredListings = filteredListings.filter(listing => {
        const listingPrice = parseCurrency(listing.price);
        return !isNaN(listingPrice) && listingPrice <= valorMaxNumber;
      });
    }
  }
  
  // Filtro por Setores
  if (setores && setores[0] !== '') {
    filteredListings = filteredListings.filter(listing => {
      // Lógica 100% corrigida para o filtro de setor
      return listing.sector && setores.includes(listing.sector);
    });
  }
  
  // Filtro por Localidades
  if (localidades && localidades[0] !== '') {
    filteredListings = filteredListings.filter(listing => {
      // Lógica 100% corrigida para o filtro de localização
      let searchableLocation = '';
      if (typeof listing.location === 'string') {
        searchableLocation = listing.location.toLowerCase();
      } else if (typeof listing.location === 'object' && listing.location !== null) {
        searchableLocation = `${listing.location.city}, ${listing.location.state}`.toLowerCase();
      }
      return localidades.some(loc => searchableLocation.includes(loc));
    });
  }

  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json(filteredListings);
}