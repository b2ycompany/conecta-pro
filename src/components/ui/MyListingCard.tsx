// src/components/ui/MyListingCard.tsx

'use client';

import { useState } from 'react';
import { ListingCard } from './ListingCard';
import type { Listing } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface MyListingCardProps {
  listing: Listing;
  onDelete: () => void; // Função para ser chamada quando o botão de excluir for clicado
}

export function MyListingCard({ listing, onDelete }: MyListingCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    // 1. A correção do Bug: Impede que o clique se propague para o Link do cartão
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    onDelete(); // 2. Chama a função de exclusão que passamos como propriedade
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Também impede a propagação para o link
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-border">
      {/* O cartão do anúncio. Clicar nele leva para a página de detalhe. */}
      <ListingCard listing={listing} />
      
      {/* Botão do Menu de Opções (Kebab Menu) */}
      <div className="absolute top-2 right-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsMenuOpen(!isMenuOpen);
          }}
          onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-gray-200 transition-colors"
        >
          <MoreVertical size={20} className="text-text-primary" />
        </button>

        {/* O Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-border z-10"
            >
              <ul>
                <li>
                  <Link 
                    href={`/anuncios/editar/${listing.id}`} 
                    onClick={handleEditClick}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit size={14} /> Editar
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}