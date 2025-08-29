// src/components/admin/RejectionModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import type { Listing } from '@/lib/types';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listingId: string, message: string) => Promise<void>;
  listing: Listing | null;
}

export function RejectionModal({ isOpen, onClose, onSubmit, listing }: RejectionModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!listing || !message.trim()) {
      alert("Por favor, escreva uma mensagem explicando o motivo da rejeição.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(listing.id, message);
    setIsSubmitting(false);
    setMessage(''); // Limpa a mensagem após o envio
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && listing && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-primary">Rejeitar Anúncio</h2>
              <p className="text-sm text-text-secondary mt-1 truncate">
                Você está a rejeitar: <span className="font-semibold">{listing.title}</span>
              </p>
            </div>
            
            <div className="p-6">
              <label htmlFor="rejectionMessage" className="font-semibold mb-2 block text-sm">
                Motivo da Rejeição (será enviado ao utilizador)*
              </label>
              <textarea
                id="rejectionMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-2 border border-border rounded-md"
                placeholder="Ex: As fotos do anúncio estão com baixa qualidade. Por favor, suba novas imagens com melhor resolução."
              />
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border rounded-md hover:bg-gray-100"
                >
                    Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Send size={16} />
                  {isSubmitting ? 'A Enviar...' : 'Confirmar e Enviar Mensagem'}
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}