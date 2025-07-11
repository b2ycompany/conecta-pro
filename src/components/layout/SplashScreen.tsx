// src/components/layout/SplashScreen.tsx

'use client';

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react'; // Usaremos um ícone como nosso logo temporário

export function SplashScreen() {
  return (
    <motion.div
      // A key é importante para o AnimatePresence (no ficheiro pai) saber qual componente está a sair
      key="splash-screen"
      className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
      // Animação de saída: fica invisível e encolhe
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
    >
      <motion.div
        // Animação de entrada: começa invisível e pequeno, depois cresce e aparece
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2, transition: { duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } }}
      >
        <Briefcase className="h-20 w-20 text-blue-400" />
      </motion.div>
    </motion.div>
  );
}