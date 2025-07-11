// src/components/layout/Onboarding.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';

// Define a estrutura de cada passo do nosso onboarding
const onboardingSteps = [
  {
    icon: ShoppingCart,
    title: 'Encontre o Seu Próximo Negócio',
    description: 'Navegue por centenas de oportunidades de negócio e imóveis comerciais verificados, prontos para você começar.',
  },
  {
    icon: Rocket,
    title: 'Venda com Facilidade',
    description: 'Anuncie o seu negócio para uma audiência qualificada de compradores e investidores, com ferramentas que valorizam o seu ativo.',
  },
  {
    icon: DollarSign,
    title: 'Invista com Inteligência',
    description: 'Descubra oportunidades de investimento, analise métricas e conecte-se com empreendedores para fazer o seu capital render.',
  },
];

// Define as propriedades que o componente espera receber, incluindo a função para avisar que o onboarding terminou
interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Se for o último passo, chama a função onComplete
      onComplete();
    }
  };

  const stepData = onboardingSteps[currentStep];

  return (
    <motion.div
      key="onboarding"
      className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm z-40 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="text-center max-w-lg w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="bg-blue-500/10 p-4 rounded-full mb-6">
              <stepData.icon className="h-16 w-16 text-blue-300" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{stepData.title}</h2>
            <p className="text-lg text-blue-200/80 mb-12">{stepData.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center space-x-3 mb-12">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNextStep}
          className="bg-blue-600 text-white font-bold py-3 px-12 rounded-full text-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentStep < onboardingSteps.length - 1 ? 'Avançar' : 'Começar Agora'}
          <ArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
}