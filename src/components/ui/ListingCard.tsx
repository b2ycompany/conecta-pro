// src/components/ui/ListingCard.tsx

'use client';

import { motion } from 'framer-motion';
import { Tag, MapPin, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

// CORREÇÃO: A linha abaixo agora EXPORTA o tipo 'Listing'.
// Isso resolve o erro de build, permitindo que outras páginas (como a de resultados)
// importem o tipo 'Listing' diretamente deste arquivo.
export type { Listing } from '@/lib/mockData';

// O import original foi removido, pois a linha acima já torna o tipo disponível aqui.
import type { Listing } from '@/lib/mockData';


interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  
  /**
   * Função inteligente para formatar a localização.
   * Ela verifica se a 'location' é um texto (formato correto) ou um objeto 
   * (formato antigo/incorreto) e retorna sempre um texto formatado,
   * tornando o componente robusto e à prova de erros.
   */
  const formatLocation = (location: any): string => {
    if (typeof location === 'string') {
      return location;
    }
    if (typeof location === 'object' && location !== null) {
      return `${location.address || ''}, ${location.number || ''} - ${location.city || ''}, ${location.state || ''}`;
    }
    return 'Localização não informada';
  };

  return (
    // O cartão inteiro é um link para a página de detalhe do anúncio.
    // Usamos a rota no plural `/anuncios/`, conforme a nossa estrutura final.
    <Link href={`/anuncios/${listing.id}`} passHref>
      <motion.div
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border cursor-pointer flex flex-col h-full"
        whileHover={{ y: -5 }}
      >
        {/* Imagem do Anúncio */}
        <div className="relative w-full h-48">
          <Image
            src={listing.imageUrl || '/placeholder.png'} // Usa uma imagem placeholder se não houver URL
            alt={listing.title || 'Anúncio sem título'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* Conteúdo do Anúncio */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Tag size={14} />
            <span>{listing.sector}</span>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2 flex-grow">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
            <MapPin size={14} /> 
            <span>{formatLocation(listing.location)}</span>
          </div>
          <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-xs">Valor</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(listing.price)}
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
