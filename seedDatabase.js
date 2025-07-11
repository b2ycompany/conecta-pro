// seedDatabase.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const businessData = [
    { title: "Padaria Artesanal", sector: "Alimentação" },
    { title: "Cafeteria Gourmet", sector: "Alimentação" },
    { title: "Hamburgueria Retrô", sector: "Alimentação" },
    { title: "Loja de Produtos Naturais", sector: "Varejo" },
    { title: "Bar de Cocktails", sector: "Alimentação" },
    { title: "Escola de Yoga", sector: "Saúde & Bem-estar" },
    { title: "Pet Shop de Luxo", sector: "Serviços" },
    { title: "Barbearia Clássica", sector: "Serviços" },
    { title: "E-commerce de Moda Sustentável", sector: "Tecnologia" },
    { title: "Agência de Marketing Digital", sector: "Serviços" },
    { title: "Fábrica de Cerveja Artesanal", sector: "Indústria" },
    { title: "Pousada Charmosa na Serra", sector: "Hotelaria" },
    { title: "Food Truck de Tacos", sector: "Alimentação" },
    { title: "Consultório de Fisioterapia", sector: "Saúde & Bem-estar" },
    { title: "Lava-rápido Ecológico", sector: "Serviços" },
    { title: "Startup de Logística", sector: "Tecnologia" },
    { title: "Fintech de Crédito", sector: "Finanças" },
    { title: "Escola de Programação", sector: "Educação" }
];

const investmentTitles = [ "Investimento em Expansão de Franquia", "Aporte para Lançamento de App", "Financiamento para Maquinário Agrícola", "Sócio-Investidor para Indústria 4.0", "Capital para E-commerce", "Projeto de Energia Solar" ];
const cities = [ "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS", "Curitiba, PR", "Salvador, BA", "Fortaleza, CE", "Recife, PE", "Florianópolis, SC", "Campinas, SP", "Sorocaba, SP", "Ribeirão Preto, SP", "Cotia, SP", "Barueri, SP" ];
const descriptions = [ "Negócio com clientela fiel e ponto comercial estratégico.", "Operação enxuta com altas margens e equipe treinada.", "Marca reconhecida no mercado local.", "Projeto inovador com equipe experiente e plano de negócios sólido.", "Mercado em alta com barreiras de entrada." ];

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// --- FUNÇÃO ATUALIZADA PARA USAR O PICSUM PHOTOS ---
function getImageUrl(index) {
    // Retorna uma imagem diferente e única a cada chamada
    return `https://picsum.photos/400/300?random=${index}`;
}

async function createMockListing(index) {
  const isBusinessSale = Math.random() > 0.3;
  const ownerId = `mock_seller_${getRandomNumber(1, 50)}`;
  const price = getRandomNumber(50000, 5000000);
  const annualRevenue = price * getRandomNumber(1, 4);
  const business = getRandomItem(businessData);
  const title = isBusinessSale ? `${business.title} #${index}` : `${getRandomItem(investmentTitles)} #${index}`;

  const listing = {
    listingType: isBusinessSale ? 'business_sale' : 'investment_seek',
    title: title,
    sector: business.sector,
    location: getRandomItem(cities),
    price: price,
    description: getRandomItem(descriptions),
    imageUrl: getImageUrl(index),
    gallery: [ getImageUrl(index + 1000), getImageUrl(index + 2000), getImageUrl(index + 3000) ],
    annualRevenue: annualRevenue,
    profitMargin: Math.random() * (0.45 - 0.10) + 0.10,
    employees: getRandomNumber(2, 50),
    monthlyCosts: { rent: annualRevenue / 12 * 0.1, utilities: annualRevenue / 12 * 0.03, payroll: annualRevenue / 12 * 0.15, others: annualRevenue / 12 * 0.05 },
    ownerId: ownerId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docId = `mock_${index.toString().padStart(4, '0')}`;
    await db.collection('listings').doc(docId).set(listing);
    console.log(`Anúncio #${index} criado: ${listing.title}`);
  } catch (error) {
    console.error(`Erro ao criar anúncio #${index}: `, error);
  }
}

async function populateDatabase() {
  console.log('Iniciando o povoamento do banco de dados com o Picsum Photos...');
  const promises = [];
  for (let i = 1; i <= 1000; i++) {
    promises.push(createMockListing(i));
  }
  await Promise.all(promises);
  console.log('Povoamento concluído! 1000 anúncios com imagens únicas foram criados.');
}

populateDatabase().catch(console.error);