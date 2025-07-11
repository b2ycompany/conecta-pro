// src/app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { InteractiveSplashScreen } from '@/components/layout/InteractiveSplashScreen';
import { Rocket, ShoppingCart, DollarSign } from 'lucide-react';

const journeyOptions = [
  { id: 'buy', title: 'Quero Comprar', icon: ShoppingCart, path: '/comprar' },
  { id: 'sell', title: 'Quero Vender', icon: Rocket, path: 'sell_journey' }, 
  { id: 'invest', title: 'Quero Investir', icon: DollarSign, path: '/investir' },
];

export default function HomePage() {
  const [appState, setAppState] = useState<'splash' | 'transitioning' | 'ready'>('splash');
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Usamos o 'user' e 'isLoading'

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => { setAppState('transitioning'); }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleJourneyClick = (path: string) => {
    if (isLoading) return;

    if (path === 'sell_journey') {
      if (user) {
        router.push('/anuncios/novo'); 
      } else {
        router.push('/login?journey=sell');
      }
    } else {
      router.push(path);
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {appState !== 'ready' ? (
          // Renderiza Splash ou a Transição
          appState === 'splash' ? <InteractiveSplashScreen key="splash" /> :
          <motion.div
            key="transition"
            className="fixed inset-0 bg-primary z-50"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: 0.8, ease: 'circOut' }}
            onAnimationComplete={() => setAppState('ready')}
          />
        ) : (
          // Renderiza o Conteúdo Principal
          <motion.div key="main-content-wrapper" className="bg-background min-h-screen">
            <div className="flex flex-col items-center justify-center min-h-screen text-text-primary p-8">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2 } }}
              >
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">A sua jornada começa aqui.</h1>
                <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl">Escolha o seu caminho e mergulhe num universo de oportunidades.</p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {journeyOptions.map((journey, index) => (
                  <motion.div
                    key={journey.id}
                    onClick={() => handleJourneyClick(journey.path)}
                    className="group cursor-pointer p-8 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:-translate-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4 + index * 0.2 } }}
                  >
                    <journey.icon className="h-10 w-10 text-primary mb-4" />
                    <h2 className="text-2xl font-semibold mb-2 text-text-primary">{journey.title}</h2>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}