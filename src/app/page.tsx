// src/app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { InteractiveSplashScreen } from '@/components/layout/InteractiveSplashScreen';
import { Rocket, ShoppingCart, DollarSign, ArrowLeft, PlusCircle } from 'lucide-react';
import { mainCategories } from '@/lib/categories';
import { useSplashScreen } from '@/contexts/SplashScreenContext';
// ALTERAÇÃO: Importamos o Modal e a nova função do serviço
// Nota: Certifique-se de que este componente existe ou crie um.
import { SuggestionModal } from '@/components/ui/SuggestionModal'; 
import { submitCategorySuggestion } from '@/lib/firestoreService';

const journeyOptions = [
  { id: 'buy', title: 'Quero Comprar', icon: ShoppingCart },
  { id: 'sell', title: 'Quero Vender', icon: Rocket },
  { id: 'invest', title: 'Quero Investir', icon: DollarSign },
];

export default function HomePage() {
  const { hasSplashScreenBeenShown, setSplashScreenShown } = useSplashScreen();
  const [animationState, setAnimationState] = useState<'splash' | 'transitioning' | 'ready'>('splash');
  const [view, setView] = useState<'journeys' | 'buy' | 'sell' | 'invest'>('journeys');
  
  // ALTERAÇÃO: Novo estado para controlar o modal
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (hasSplashScreenBeenShown) {
      setAnimationState('ready');
    }
  }, [hasSplashScreenBeenShown]);

  const handleJourneyClick = (journeyId: 'buy' | 'sell' | 'invest') => {
    setView(journeyId);
  };
  
  const handleCategoryClick = (categoryId: string) => {
    if (view === 'buy' || view === 'invest') {
      router.push(`/comprar/${categoryId}`);
    } else if (view === 'sell') {
      if (user) {
        router.push(`/anuncios/novo?category=${categoryId}`);
      } else {
        router.push(`/login?journey=sell&category=${categoryId}`);
      }
    }
  };

  // ALTERAÇÃO: Nova função para lidar com o envio da sugestão
  const handleSuggestionSubmit = async (categoryName: string, description: string) => {
    if (!user || !user.name) {
      alert("Você precisa estar logado para sugerir uma categoria.");
      router.push('/login');
      return;
    }
    try {
      await submitCategorySuggestion({
        categoryName,
        description,
        userId: user.uid,
        userName: user.name, // Assumindo que o nome do utilizador está disponível em user.name
      });
      alert("Sugestão enviada com sucesso! Obrigado por contribuir.");
      setIsSuggestionModalOpen(false); // Fecha o modal após o sucesso
    } catch (error) {
      alert("Ocorreu um erro ao enviar a sua sugestão.");
    }
  };

  const renderContent = () => {
    const categoriesToShow = mainCategories.filter(cat => view !== 'journeys' && cat.journeys.includes(view));
    const viewTitles: {[key: string]: string} = { buy: 'O que você deseja comprar?', sell: 'O que você deseja vender?', invest: 'Em que você deseja investir?'};

    return (
        <motion.div 
            key="main-content"
            className="bg-background min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col items-center justify-center min-h-screen text-text-primary p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-6xl">
                    <AnimatePresence mode="wait">
                        {view === 'journeys' ? (
                            <motion.div key="journeys-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <motion.div className="text-center mb-12" initial={{ y: -20, opacity: 0 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2 } }}>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">A sua jornada começa aqui.</h1>
                                    <p className="mt-4 text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">Escolha o seu caminho e mergulhe num universo de oportunidades.</p>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {journeyOptions.map((journey, index) => (
                                        <motion.div key={journey.id} onClick={() => handleJourneyClick(journey.id as 'buy' | 'sell' | 'invest')} className="group cursor-pointer p-8 bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4 + index * 0.1 } }}>
                                            <journey.icon className="h-10 w-10 text-blue-600 mb-4" />
                                            <h2 className="text-2xl font-semibold mb-2 text-text-primary">{journey.title}</h2>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="categories-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="text-center mb-12">
                                    <button onClick={() => setView('journeys')} className="flex items-center gap-2 mx-auto text-text-secondary hover:text-text-primary mb-4"><ArrowLeft size={16}/> Voltar</button>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{viewTitles[view]}</h1>
                                    <p className="mt-4 text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">Selecione uma categoria para começar.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {categoriesToShow.map((category, index) => (
                                       <motion.div key={category.id} onClick={() => handleCategoryClick(category.id)} className="group cursor-pointer p-4 text-center bg-white border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.05 } }} >
                                           <category.icon className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
                                           <h3 className="text-sm font-semibold text-text-primary">{category.name}</h3>
                                       </motion.div>
                                    ))}
                                    {/* ALTERAÇÃO: O cartão "Não encontrou?" agora abre o modal */}
                                    {view === 'sell' && (
                                       <motion.div 
                                        onClick={() => setIsSuggestionModalOpen(true)}
                                        className="group cursor-pointer p-4 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-600 hover:bg-white flex flex-col justify-center items-center transition-colors"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: categoriesToShow.length * 0.05 } }}
                                       >
                                           <PlusCircle className="h-8 w-8 text-gray-400 mb-3 mx-auto transition-colors group-hover:text-blue-600" />
                                           <h3 className="text-sm font-semibold text-text-secondary">Não encontrou?</h3>
                                       </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
  };

  // Precisamos de renderizar o Modal fora do switch para que ele possa ser exibido
  return (
    <>
      {/* Lógica do switch para renderizar splash/transição/conteúdo */}
      {(() => {
        switch (animationState) {
          case 'splash': return <InteractiveSplashScreen key="splash" onAnimationComplete={() => setAnimationState('transitioning')} />;
          case 'transitioning': return <motion.div key="transition" className="fixed inset-0 bg-blue-600 z-50" initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(150% at 50% 50%)' }} transition={{ duration: 0.8, ease: 'circOut' }} onAnimationComplete={() => { setAnimationState('ready'); setSplashScreenShown(); }} />;
          case 'ready': return renderContent();
          default: return null;
        }
      })()}

      {/* O Modal de Sugestão é renderizado aqui, por cima de tudo */}
      <SuggestionModal 
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        onSubmit={handleSuggestionSubmit}
      />
    </>
  );
}