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
  Ticket
} from 'lucide-react';

export const mainCategories = [
  {
    id: 'negocios',
    name: 'Negócios e Investimentos',
    icon: Building,
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
    fields: [
      { name: 'price', label: 'Preço do Ingresso', type: 'currency', required: true },
      { name: 'eventName', label: 'Nome do Evento', type: 'text', required: true },
      { name: 'eventDate', label: 'Data do Evento', type: 'date', required: true },
      { name: 'eventLocation', label: 'Local do Evento', type: 'text', required: true },
    ]
  },
];