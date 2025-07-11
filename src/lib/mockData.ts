// src/lib/mockData.ts

export type Listing = {
  id: string;
  title: string;
  sector: string;
  price: number;
  location: string;
  imageUrl: string;
  description: string;
  annualRevenue: number;
  profitMargin: number;
  employees: number;
  gallery: string[];
  ownerId: string; // 1. Adicionamos a propriedade que faltava
};

// 2. Adicionamos um ownerId simulado para cada anúncio
export const allListings: Listing[] = [
  { 
    id: '1', 
    title: 'Cafeteria Charmosa no Centro', 
    sector: 'Restaurantes', 
    price: 250000, 
    location: 'Cotia, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
    description: 'Uma cafeteria aconchegante com clientela fiel. Totalmente equipada.',
    annualRevenue: 480000,
    profitMargin: 0.25,
    employees: 4,
    gallery: [
      'https://images.unsplash.com/photo-1511920183276-542a97fb494d?w=400',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
      'https://images.unsplash.com/photo-1562087926-662f8473a216?w=400'
    ],
    ownerId: 'seller_abc' 
  },
  { 
    id: '2', 
    title: 'Pizzaria Tradicional de Bairro', 
    sector: 'Restaurantes', 
    price: 180000, 
    location: 'Barueri, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
    description: 'Pizzaria com forno a lenha e delivery consolidado na região.',
    annualRevenue: 350000,
    profitMargin: 0.22,
    employees: 5,
    gallery: [],
    ownerId: 'seller_abc'
  },
  { 
    id: '3', 
    title: 'Restaurante Vegano Moderno', 
    sector: 'Restaurantes', 
    price: 480000, 
    location: 'São Paulo, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    description: 'Restaurante de comida vegana com alto tráfego e design moderno.',
    annualRevenue: 950000,
    profitMargin: 0.30,
    employees: 8,
    gallery: [],
    ownerId: 'seller_xyz'
  },
  { 
    id: '4', 
    title: 'Startup de SaaS B2B Inovadora', 
    sector: 'Tecnologia', 
    price: 1500000, 
    location: 'Barueri, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400',
    description: 'Plataforma SaaS de gestão com receita recorrente e clientes internacionais.',
    annualRevenue: 1200000,
    profitMargin: 0.60,
    employees: 12,
    gallery: [],
    ownerId: 'seller_xyz'
  },
  { 
    id: '5', 
    title: 'E-commerce de Eletrônicos', 
    sector: 'Tecnologia', 
    price: 750000, 
    location: 'São Paulo, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23d7e9a242b9?w=400',
    description: 'E-commerce com marca estabelecida e alta pontuação em marketplaces.',
    annualRevenue: 2500000,
    profitMargin: 0.18,
    employees: 7,
    gallery: [],
    ownerId: 'seller_abc'
  },
  { 
    id: '6', 
    title: 'Loja de Roupas Boutique em Shopping', 
    sector: 'Varejo', 
    price: 450000, 
    location: 'Cotia, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400',
    description: 'Loja de moda feminina com excelente ponto em shopping de grande movimento.',
    annualRevenue: 850000,
    profitMargin: 0.35,
    employees: 3,
    gallery: [],
    ownerId: 'seller_xyz'
  },
  { 
    id: '8', 
    title: 'Escola de Inglês com 100+ alunos', 
    sector: 'Educação', 
    price: 350000, 
    location: 'Itapevi, SP', 
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
    description: 'Escola de idiomas com metodologia própria e corpo docente qualificado.',
    annualRevenue: 600000,
    profitMargin: 0.40,
    employees: 6,
    gallery: [],
    ownerId: 'seller_abc'
  }
];