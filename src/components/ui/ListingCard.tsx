// src/components/ui/ListingCard.tsx

'use client';

import { motion } from 'framer-motion';
import { Tag, MapPin, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';
import type { Listing } from '@/lib/types'; // Agora usa o nosso tipo flexível

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  
  const formatLocation = (location: any): string => {
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location !== null) {
      return `${location.city || ''}, ${location.state || ''}`;
    }
    return 'Localização não informada';
  };

  const getPriceAsNumber = (price: string | number): number => {
    if (typeof price === 'number') return price;
    if (typeof price !== 'string') return NaN;
    const numericString = price.replace(/[^0-9,]+/g, "").replace(",", ".");
    return parseFloat(numericString);
  };

  const numericPrice = getPriceAsNumber(listing.price);

  return (
    <Link href={`/anuncios/${listing.id}`} passHref>
      <motion.div
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border cursor-pointer flex flex-col h-full group"
        whileHover={{ y: -5 }}
      >
        <div className="relative w-full h-48">
          <Image
            src={listing.imageUrl || '/placeholder.png'}
            alt={listing.title || 'Anúncio sem título'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          {/* **A CORREÇÃO PRINCIPAL ESTÁ AQUI**
            Agora, só exibimos o 'sector' se ele existir no objeto 'listing'.
            Isto torna o componente adaptável para qualquer categoria.
          */}
          {listing.sector && (
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                <Tag size={14} /><span>{listing.sector}</span>
            </div>
          )}
          <h3 className="text-xl font-bold text-text-primary mb-2 flex-grow">{listing.title}</h3>
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
            <MapPin size={14} /> 
            <span>{formatLocation(listing.location)}</span>
          </div>
          <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-xs">Valor</p>
              <p className="text-xl font-bold text-blue-600">
                {!isNaN(numericPrice) ? formatCurrency(numericPrice) : "Preço a consultar"}
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
               <ArrowUpRight size={20} className="text-text-secondary group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}