// src/components/ui/SuggestionModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string, description: string) => Promise<void>;
}

export function SuggestionModal({ isOpen, onClose, onSubmit }: SuggestionModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      alert("Por favor, preencha o nome da categoria.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(categoryName, description);
    setIsSubmitting(false);
    onClose(); // Fecha o modal após o envio
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Lightbulb className="text-yellow-400" size={24} />
                <h2 className="text-xl font-bold text-text-primary">Sugerir Nova Categoria</h2>
              </div>
              <p className="text-sm text-text-secondary mt-1">Ajude-nos a melhorar a plataforma. A sua sugestão será analisada pela nossa equipa.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="categoryName" className="font-semibold mb-1 block text-sm">Nome da Categoria*</label>
                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2 border border-border rounded-md"
                  placeholder="Ex: Artigos Desportivos"
                />
              </div>
              <div>
                <label htmlFor="description" className="font-semibold mb-1 block text-sm">Descrição (Opcional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-border rounded-md"
                  placeholder="Descreva que tipo de produtos ou serviços se encaixam aqui..."
                />
              </div>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'A Enviar...' : 'Enviar Sugestão'}
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}