// src/app/comprar/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, DollarSign, MapPin, Search, Sparkles, LoaderCircle } from 'lucide-react';

// Definimos um tipo para os dados da categoria que virão da API
type Category = {
  id: string;
  name: string;
};

export default function SearchSetupPage() {
  const router = useRouter();

  // Estados para guardar os dados da API e o estado de carregamento
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados para guardar as preferências do utilizador
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [investmentRange, setInvestmentRange] = useState<number>(500000);
  const [locations, setLocations] = useState<string>('');

  // Hook para buscar os dados da API quando a página carrega
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categorias');
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Falha ao buscar categorias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []); 

  // Função para lidar com a seleção (clique) de um setor
  const handleSectorToggle = (sectorName: string) => {
    setSelectedSectors(prev =>
      prev.includes(sectorName)
        ? prev.filter(s => s !== sectorName)
        : [...prev, sectorName]
    );
  };

  // Função para formatar o valor do investimento para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  // Função para lidar com a submissão do formulário de busca
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const queryParams = new URLSearchParams();
    if (selectedSectors.length > 0) {
      queryParams.set('setores', selectedSectors.join(','));
    }
    queryParams.set('valor_max', investmentRange.toString());
    if (locations) {
      queryParams.set('localidades', locations);
    }
    
    // Redireciona o utilizador para a página de resultados com os filtros na URL
    router.push(`/resultados?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center">
      <motion.div 
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">Configure a sua busca</h1>
          <p className="mt-4 text-lg text-text-secondary">Diga-nos o que procura e mostraremos as melhores oportunidades.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Seção de Setores */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
            <label className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-6">
              <Building className="text-primary" /> Qual setor de negócio lhe interessa?
            </label>
            <div className="flex flex-wrap gap-3">
              {isLoading ? (
                <div className="w-full flex items-center justify-center text-text-secondary gap-2">
                  <LoaderCircle className="animate-spin" /> A carregar categorias...
                </div>
              ) : (
                categories.map(category => {
                  const isSelected = selectedSectors.includes(category.name);
                  
                  const style = isSelected ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      borderColor: 'var(--color-primary)'
                  } : {};

                  return (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => handleSectorToggle(category.name)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 border-2 ${
                        !isSelected && 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                      }`}
                      style={style}
                    >
                      {category.name}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Seção de Investimento */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
            <label htmlFor="investment" className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4"><DollarSign className="text-primary" /> Qual o seu teto de investimento?</label>
            <div className="flex items-center gap-4">
              <input id="investment" type="range" min="50000" max="5000000" step="50000" value={investmentRange} onChange={e => setInvestmentRange(Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"/>
              <span className="font-bold text-primary text-xl w-48 text-center">{formatCurrency(investmentRange)}</span>
            </div>
          </motion.div>

          {/* Seção de Localidades */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}>
            <label htmlFor="locations" className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4"><MapPin className="text-primary" /> Onde? (separe cidades por vírgula)</label>
            <input id="locations" type="text" value={locations} onChange={e => setLocations(e.target.value)} placeholder="Ex: Cotia, Itapevi, Barueri" className="w-full px-4 py-3 bg-input-bg border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
          </motion.div>

          {/* Botão de Submissão */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} className="text-center pt-6">
            <button
              type="submit"
              className="font-bold text-lg py-4 px-16 rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <Search /> Ver Oportunidades
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}