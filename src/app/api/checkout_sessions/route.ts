// src/app/api/checkout_sessions/route.ts

import { NextResponse, NextRequest } from 'next/server';
// Importamos a biblioteca do Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { listingId, listingTitle } = await request.json();

  if (!listingId || !listingTitle) {
    return NextResponse.json({ error: 'ID do Anúncio e Título são obrigatórios' }, { status: 400 });
  }

  try {
    // Cria uma sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Destaque para: ${listingTitle}`,
              description: 'Coloque o seu anúncio no topo dos resultados por 7 dias.',
            },
            unit_amount: 1000, // R$ 10,00 (valor em centavos)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Guardamos o ID do nosso anúncio nos metadados para sabermos qual anúncio atualizar após o pagamento
      metadata: {
        listingId: listingId,
      },
      success_url: `${request.headers.get('origin')}/meus-anúncios?payment=success`,
      cancel_url: `${request.headers.get('origin')}/meus-anúncios?payment=cancel`,
    });

    // Retorna a URL da sessão de checkout para o frontend
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}