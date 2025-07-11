// src/app/investir/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Banknote, Handshake, TrendingUp, Search, Sparkles, Shield, BarChart, Calendar } from 'lucide-react';

const opportunityTypes = ['Participação em Negócio', 'Financiamento de Projeto', 'Compra de Ativos'];
const riskLevels = ['Conservador', 'Moderado', 'Agressivo'];
const timeHorizons = ['Curto Prazo (< 2 anos)', 'Médio Prazo (2-5 anos)', 'Longo Prazo (> 5 anos)'];

export default function InvestSetupPage() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<string | null>(null);
  const [investmentRange, setInvestmentRange] = useState<number>(250000);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert(`Busca para Investidor:\n- Tipo: ${selectedType}\n- Risco: ${selectedRisk}\n- Horizonte: ${selectedHorizon}\n- Aporte até: ${formatCurrency(investmentRange)}`);
    // router.push('/resultados?tipo=investimento...');
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
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">Defina o seu perfil de investidor</h1>
          <p className="mt-4 text-lg text-text-secondary">Encontre oportunidades que se alinham com os seus objetivos financeiros.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Tipo de Oportunidade */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
            <label className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-6">
              <Handshake className="text-primary" /> Qual tipo de oportunidade você procura?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunityTypes.map(type => (
                <button type="button" key={type} onClick={() => setSelectedType(type)}
                  className={`p-4 text-center rounded-lg font-medium transition-all duration-200 border-2 ${
                    selectedType === type ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg' : 'bg-white text-text-secondary border-border hover:border-blue-600 hover:text-blue-600'
                  }`}
                >{type}</button>
              ))}
            </div>
          </motion.div>

          {/* Nível de Risco */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
            <label className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-6">
              <Shield className="text-primary" /> Qual seu apetite ao risco?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskLevels.map(level => (
                <button type="button" key={level} onClick={() => setSelectedRisk(level)}
                  className={`p-4 text-center rounded-lg font-medium transition-all duration-200 border-2 ${
                    selectedRisk === level ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg' : 'bg-white text-text-secondary border-border hover:border-blue-600 hover:text-blue-600'
                  }`}
                >{level}</button>
              ))}
            </div>
          </motion.div>

           {/* Horizonte de Tempo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }}>
            <label className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-6">
              <Calendar className="text-primary" /> Qual o seu horizonte de tempo?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {timeHorizons.map(horizon => (
                <button type="button" key={horizon} onClick={() => setSelectedHorizon(horizon)}
                  className={`p-4 text-center rounded-lg font-medium transition-all duration-200 border-2 ${
                    selectedHorizon === horizon ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg' : 'bg-white text-text-secondary border-border hover:border-blue-600 hover:text-blue-600'
                  }`}
                >{horizon}</button>
              ))}
            </div>
          </motion.div>

          {/* Seção de Aporte */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}>
            <label htmlFor="investment" className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Banknote className="text-primary" /> Qual o seu tíquete de investimento?
            </label>
            <div className="flex items-center gap-4">
              <input id="investment" type="range" min="10000" max="10000000" step="10000" value={investmentRange} onChange={e => setInvestmentRange(Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-blue-600"/>
              <span className="font-bold text-blue-600 text-xl w-48 text-center">{formatCurrency(investmentRange)}</span>
            </div>
          </motion.div>

          {/* Botão de Submissão */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} className="text-center pt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-16 rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105 flex items-center justify-center gap-3 mx-auto">
              <Search /> Buscar Investimentos
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}