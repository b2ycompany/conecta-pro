// src/app/comprar/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, DollarSign, MapPin, Search, Sparkles } from 'lucide-react';
import { mainCategories } from '@/lib/categories'; 

const categories = mainCategories.filter(cat => cat.journeys.includes('buy'));

export default function SearchSetupPage() {
  const router = useRouter();

  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [investmentRange, setInvestmentRange] = useState<number>(500000);
  const [locations, setLocations] = useState<string>('');

  const handleSectorToggle = (sectorName: string) => {
    setSelectedSectors(prev =>
      prev.includes(sectorName)
        ? prev.filter(s => s !== sectorName)
        : [...prev, sectorName]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const queryParams = new URLSearchParams();

    const mainQuery = locations ? locations : selectedSectors.join(' ');
    if (mainQuery) {
      queryParams.set('query', mainQuery);
    }
    
    if (selectedSectors.length > 0) {
      queryParams.set('refine_category', selectedSectors.join(','));
    }
    queryParams.set('range_price', `0:${investmentRange}`);
    
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
          <Sparkles className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">Configure a sua busca</h1>
          <p className="mt-4 text-lg text-text-secondary">Diga-nos o que procura e mostraremos as melhores oportunidades.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Seção de Setores */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
            <label className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-6">
              <Building className="text-blue-600" /> Qual setor de negócio lhe interessa?
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => {
                  const isSelected = selectedSectors.includes(category.name);
                  return (
                    <motion.button
                      type="button"
                      key={category.id}
                      onClick={() => handleSectorToggle(category.name)}
                      className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 border-2 ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-text-secondary border-border hover:border-blue-500 hover:text-blue-500'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.name}
                    </motion.button>
                  )
              })}
            </div>
          </motion.div>

          {/* Seção de Investimento */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
            <label htmlFor="investment" className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4"><DollarSign className="text-blue-600" /> Qual o seu teto de investimento?</label>
            <div className="flex items-center gap-4">
              <input 
                id="investment" 
                type="range" 
                min="50000" 
                max="5000000" 
                step="50000" 
                value={investmentRange} 
                onChange={e => setInvestmentRange(Number(e.target.value))} 
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="font-bold text-blue-600 text-xl w-48 text-center bg-blue-50 py-2 rounded-md">{formatCurrency(investmentRange)}</span>
            </div>
          </motion.div>

          {/* Seção de Localidades */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}>
            <label htmlFor="locations" className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4"><MapPin className="text-blue-600" /> Onde? (separe cidades por vírgula)</label>
            <input 
              id="locations" 
              type="text" 
              value={locations} 
              onChange={e => setLocations(e.target.value)} 
              placeholder="Ex: Cotia, Itapevi, Barueri" 
              className="w-full px-4 py-3 bg-white border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          {/* Botão de Submissão */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} className="text-center pt-6">
            <motion.button
              type="submit"
              className="font-bold text-lg bg-blue-600 text-white py-4 px-16 rounded-full shadow-lg flex items-center justify-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search /> Ver Oportunidades
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}