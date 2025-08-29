// src/components/ui/MyListingCard.tsx

'use client';

import { useState } from 'react';
import { ListingCard } from './ListingCard';
import type { Listing } from '@/lib/types'; // Import corrigido para usar os tipos globais
import { getModerationMessages } from '@/lib/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Clock, CheckCircle2, XCircle, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';

interface MyListingCardProps {
  listing: Listing;
  onDelete: (listingId: string, listingTitle: string) => void;
}

export function MyListingCard({ listing, onDelete }: MyListingCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    onDelete(listing.id, listing.title);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // ALTERAÇÃO: Mostra o feedback do admin
  const handleShowFeedback = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    try {
        const messages = await getModerationMessages(listing.id);
        if (messages.length > 0) {
          // Usamos um 'alert' simples. No futuro, isto pode ser um modal mais elegante.
          alert(`Feedback da Moderação:\n\n"${messages[0].text}"`);
        } else {
          alert("Nenhum feedback encontrado.");
        }
    } catch(error) {
        alert("Não foi possível carregar o feedback.");
    }
  };

  const statusInfo = {
    pending: { text: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    approved: { text: 'Aprovado', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
    rejected: { text: 'Rejeitado', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
  };
  const currentStatus = statusInfo[listing.status] || statusInfo.pending;
  const IconComponent = currentStatus.icon;

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-border flex flex-col h-full overflow-hidden">
      {/* O cartão do anúncio. Clicar nele leva para a página de detalhe. */}
      <ListingCard listing={listing} />
      
      {/* ALTERAÇÃO: Barra de Status e Feedback */}
      <div className={`p-2 flex justify-between items-center text-sm font-medium border-t ${currentStatus.color}`}>
        <div className="flex items-center gap-2">
            <IconComponent size={16} />
            <span>{currentStatus.text}</span>
        </div>
        {listing.status === 'rejected' && (
          <button onClick={handleShowFeedback} className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-semibold">
            <MessageSquareWarning size={14} /> Ver Motivo
          </button>
        )}
      </div>

      {/* Botão do Menu de Opções (Kebab Menu) */}
      <div className="absolute top-2 right-2 z-10">
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
              className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-border z-20"
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