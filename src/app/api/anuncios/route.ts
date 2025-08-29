// src/app/anuncios/route.ts

import { NextResponse } from 'next/server';
import { allListings } from '@/lib/mockData';
import { parseCurrency } from '@/lib/formatters';
import type { Listing } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const setores = searchParams.get('setores')?.split(',');
  const valorMax = searchParams.get('valor_max');
  
  let filteredListings: Listing[] = allListings;

  if (valorMax) {
    const valorMaxNumber = Number(valorMax);
    if (!isNaN(valorMaxNumber)) {
      // ESTA É A LÓGICA CORRIGIDA
      filteredListings = filteredListings.filter(listing => {
        const listingPrice = parseCurrency(listing.price);
        return !isNaN(listingPrice) && listingPrice <= valorMaxNumber;
      });
    }
  }

  if (setores && setores[0] !== '') {
    filteredListings = filteredListings.filter(listing => {
      return listing.sector && setores.includes(listing.sector);
    });
  }

  return NextResponse.json(filteredListings);
}