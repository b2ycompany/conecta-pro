// src/lib/categories.ts

import { 
  Building, 
  Car, 
  Home, 
  Shirt, 
  Smartphone, 
  Wrench, 
  Sofa, 
  BriefcaseBusiness, 
  Dog,
  Ticket,
  PiggyBank
} from 'lucide-react';

// ALTERAÇÃO: Adicionada uma propriedade 'journeys' a cada categoria.
// Isto permite-nos saber em que jornada (comprar, vender, investir) cada categoria deve aparecer.
export const mainCategories = [
  {
    id: 'negocios',
    name: 'Negócios e Investimentos',
    icon: Building,
    journeys: ['buy', 'sell', 'invest'], // Disponível em todas as jornadas
    fields: [
      { name: 'price', label: 'Preço de Venda / Aporte', type: 'currency', required: true },
      { name: 'annualRevenue', label: 'Faturamento Anual', type: 'currency', required: false },
      { name: 'profitMargin', label: 'Margem de Lucro (%)', type: 'percentage', required: false },
      { name: 'employees', label: 'Nº de Funcionários', type: 'number', required: false },
    ]
  },
  {
    id: 'imoveis',
    name: 'Imóveis',
    icon: Home,
    journeys: ['buy', 'sell', 'invest'], // Também pode ser um investimento
    fields: [
      { name: 'price', label: 'Preço de Venda / Aluguel', type: 'currency', required: true },
      { name: 'bedrooms', label: 'Nº de Quartos', type: 'number', required: true },
      { name: 'bathrooms', label: 'Nº de Banheiros', type: 'number', required: true },
      { name: 'area', label: 'Área (m²)', type: 'number', required: true },
    ]
  },
  {
    id: 'veiculos',
    name: 'Veículos',
    icon: Car,
    journeys: ['buy', 'sell'],
    fields: [
      { name: 'price', label: 'Preço de Venda', type: 'currency', required: true },
      { name: 'brand', label: 'Marca', type: 'text', required: true },
      { name: 'model', label: 'Modelo', type: 'text', required: true },
      { name: 'year', label: 'Ano', type: 'number', required: true },
      { name: 'mileage', label: 'Quilometragem (km)', type: 'number', required: false },
    ]
  },
  {
    id: 'eletronicos',
    name: 'Eletrônicos',
    icon: Smartphone,
    journeys: ['buy', 'sell'],
    fields: [
        { name: 'price', label: 'Preço de Venda', type: 'currency', required: true },
        { name: 'brand', label: 'Marca', type: 'text', required: true },
        { name: 'model', label: 'Modelo', type: 'text', required: false },
        { name: 'condition', label: 'Condição (Novo/Usado)', type: 'text', required: true },
    ]
  },
  {
    id: 'roupas',
    name: 'Roupas e Acessórios',
    icon: Shirt,
    journeys: ['buy', 'sell'],
    fields: [
        { name: 'price', label: 'Preço de Venda', type: 'currency', required: true },
        { name: 'brand', label: 'Marca', type: 'text', required: false },
        { name: 'size', label: 'Tamanho', type: 'text', required: true },
        { name: 'gender', label: 'Gênero (Masc./Fem./Unissex)', type: 'text', required: false },
    ]
  },
  {
    id: 'servicos',
    name: 'Serviços',
    icon: Wrench,
    journeys: ['buy', 'sell'],
    fields: [
      { name: 'price', label: 'Preço (ou Preço/hora)', type: 'currency', required: true },
      { name: 'serviceType', label: 'Tipo de Serviço', type: 'text', required: true },
      { name: 'experience', label: 'Experiência na Área', type: 'text', required: false },
    ]
  },
  {
    id: 'casa_e_jardim',
    name: 'Para Casa e Jardim',
    icon: Sofa,
    journeys: ['buy', 'sell'],
    fields: [
      { name: 'price', label: 'Preço de Venda', type: 'currency', required: true },
      { name: 'condition', label: 'Condição (Novo/Usado)', type: 'text', required: true },
      { name: 'material', label: 'Material Principal', type: 'text', required: false },
    ]
  },
  {
    id: 'empregos',
    name: 'Vagas de Emprego',
    icon: BriefcaseBusiness,
    journeys: [], // Uma vaga de emprego não se 'compra' ou 'vende' da mesma forma
    fields: [
      { name: 'salary', label: 'Salário / Remuneração', type: 'currency', required: true },
      { name: 'role', label: 'Cargo / Posição', type: 'text', required: true },
      { name: 'contractType', label: 'Tipo de Contrato (CLT, PJ, etc.)', type: 'text', required: true },
      { name: 'workModel', label: 'Modelo (Presencial, Híbrido, Remoto)', type: 'text', required: true },
    ]
  },
  {
    id: 'animais',
    name: 'Animais de Estimação',
    icon: Dog,
    journeys: ['buy', 'sell'],
    fields: [
      { name: 'price', label: 'Preço', type: 'currency', required: true },
      { name: 'breed', label: 'Raça', type: 'text', required: true },
      { name: 'age', label: 'Idade', type: 'text', required: true },
    ]
  },
  {
    id: 'eventos',
    name: 'Ingressos e Eventos',
    icon: Ticket,
    journeys: ['buy', 'sell'],
    fields: [
      { name: 'price', label: 'Preço do Ingresso', type: 'currency', required: true },
      { name: 'eventName', label: 'Nome do Evento', type: 'text', required: true },
      { name: 'eventDate', label: 'Data do Evento', type: 'date', required: true },
      { name: 'eventLocation', label: 'Local do Evento', type: 'text', required: true },
    ]
  },
  // NOVA CATEGORIA SUGERIDA PARA A JORNADA "INVESTIR"
  {
    id: 'startups',
    name: 'Startups',
    icon: PiggyBank,
    journeys: ['invest'],
    fields: [
      { name: 'price', label: 'Investimento Procurado', type: 'currency', required: true },
      { name: 'sector', label: 'Setor da Startup', type: 'text', required: true },
      { name: 'valuation', label: 'Valuation', type: 'currency', required: false },
    ]
  },
];