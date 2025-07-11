// src/components/ui/FloatingContactButton.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Globe, MessageCircle, X } from 'lucide-react';

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const contactInfo = {
    developer: "Desenvolvido por B2Y Lion Group",
    website: "https://group-tau.vercel.app/",
    phone: "+5511965520979",
    email: "b2ylion@gmail.com",
  };

  const parentVariants = {
    closed: {
      transition: {
        staggerChildren: 0.08,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  };

  const childVariants = {
    closed: {
      opacity: 0,
      y: 15,
    },
    open: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={parentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col items-end gap-3 mb-3"
          >
            <motion.p variants={childVariants} className="bg-white text-sm text-text-primary px-4 py-2 rounded-lg shadow-lg">
              {contactInfo.developer}
            </motion.p>
            
            <motion.a variants={childVariants} href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100">
              <span className="text-sm font-semibold">Visitar Site</span>
              <Globe className="text-blue-600" />
            </motion.a>
            
            <motion.a variants={childVariants} href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100">
              <span className="text-sm font-semibold">Enviar Email</span>
              <Mail className="text-blue-600" />
            </motion.a>

            <motion.a variants={childVariants} href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100">
              <span className="text-sm font-semibold">Ligar Agora</span>
              <Phone className="text-blue-600" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        // Cor de fundo alterada para verde vibrante para maior destaque
        className="bg-green-500 text-white rounded-full p-4 shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        // Animação de pulsação e rotação para chamar a atenção
        animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <AnimatePresence mode="wait">
            {isOpen ? (
                <motion.div key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
                    <X size={28} />
                </motion.div>
            ) : (
                <motion.div key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
                    <MessageCircle size={28} />
                </motion.div>
            )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}