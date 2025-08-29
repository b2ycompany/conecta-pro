// src/app/api/anuncios/route.ts

import { NextResponse } from 'next/server';
import { allListings } from '@/lib/mockData';
import { parseCurrency } from '@/lib/formatters';
import type { Listing } from '@/lib/types'; // Importamos o tipo Listing para clareza

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
      filteredListings = filteredListings.filter(listing => {
        const listingPrice = parseCurrency(listing.price);
        return !isNaN(listingPrice) && listingPrice <= valorMaxNumber;
      });
    }
  }
  
  // Filtro por Setores
  if (setores && setores[0] !== '') {
    filteredListings = filteredListings.filter(listing => {
      // CORREÇÃO 1: Verificamos se listing.sector existe antes de usar .includes()
      return listing.sector && setores.includes(listing.sector);
    });
  }
  
  // Filtro por Localidades
  if (localidades && localidades[0] !== '') {
    filteredListings = filteredListings.filter(listing => {
        // CORREÇÃO 2: Verificamos se listing.location é um objeto ou uma string
        let searchableLocation = '';
        if (typeof listing.location === 'string') {
          searchableLocation = listing.location.toLowerCase();
        } else if (typeof listing.location === 'object' && listing.location !== null) {
          // Criamos uma string de busca com cidade e estado se for um objeto
          searchableLocation = `${listing.location.city}, ${listing.location.state}`.toLowerCase();
        }
        
        return localidades.some(loc => searchableLocation.includes(loc));
    });
  }

  // Simula uma pequena demora da rede para testes de UI
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json(filteredListings);
}