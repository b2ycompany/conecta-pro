// src/components/ui/ReviewFormModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  reviewedUserName: string;
}

export function ReviewFormModal({ isOpen, onClose, onSubmit, reviewedUserName }: ReviewFormModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      alert("Por favor, selecione uma nota e escreva um comentário.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(rating, comment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Avaliar {reviewedUserName}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold mb-2">A sua nota:</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <Star
                      key={starValue}
                      size={32}
                      className={`cursor-pointer transition-colors ${
                        starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="font-semibold mb-2 block">O seu comentário:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full p-2 border border-border rounded-md"
                placeholder={`Descreva a sua experiência com ${reviewedUserName}...`}
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
            >
              {isSubmitting ? 'A Submeter...' : 'Submeter Avaliação'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}