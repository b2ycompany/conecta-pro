// src/components/ui/JourneySelection.tsx

'use client'; // Esta diretiva é crucial, pois transforma este ficheiro num Client Component.

import { useRouter } from 'next/navigation';
import { Rocket, ShoppingCart, DollarSign } from 'lucide-react';

// O tipo Journey precisa ser redefinido ou importado aqui para garantir a consistência das props.
type Journey = {
  id: 'sell' | 'buy' | 'invest';
  title: string;
  description: string;
  icon: 'rocket' | 'cart' | 'dollar';
};

// Definimos as propriedades que este componente espera receber.
interface JourneySelectionProps {
  journeys: Journey[];
}

// Criamos um mapa (dicionário) para associar a string do ícone ao componente React correspondente.
// Esta é a solução para evitar passar componentes através da fronteira servidor-cliente.
const iconMap = {
  rocket: Rocket,
  cart: ShoppingCart,
  dollar: DollarSign,
};

// Este é o nosso componente interativo.
export function JourneySelection({ journeys }: JourneySelectionProps) {
  // O hook useRouter permite a navegação programática entre as páginas.
  const router = useRouter();

  // Função que é chamada quando um cartão é clicado.
  const handleJourneySelection = (journeyId: Journey['id']) => {
    // Redireciona o utilizador para a página de login, passando a jornada escolhida como um parâmetro de URL.
    router.push(`/login?journey=${journeyId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {journeys.map((journey) => {
        // Para cada objeto de jornada, encontramos o componente de ícone correto no nosso mapa.
        const IconComponent = iconMap[journey.icon];

        return (
          <div
            key={journey.id}
            onClick={() => handleJourneySelection(journey.id)}
            className="group cursor-pointer p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg 
                       hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Renderizamos o componente do ícone que foi obtido dinamicamente do mapa. */}
            <IconComponent className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            
            <h2 className="text-2xl font-semibold mb-2">{journey.title}</h2>
            <p className="text-blue-200/80 leading-relaxed">{journey.description}</p>
          </div>
        );
      })}
    </div>
  );
}