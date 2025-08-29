// src/app/api/checkout_sessions/route.ts

import { NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const { listingId, listingTitle } = await request.json();

  if (!listingId || !listingTitle) {
    return NextResponse.json({ error: 'ID do Anúncio e Título são obrigatórios' }, { status: 400 });
  }

  try {
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
      // Guardamos o ID do nosso anúncio nos metadados do Stripe
      metadata: {
        listingId: listingId,
      },
      success_url: `${request.headers.get('origin')}/meus-anuncios?payment=success`,
      cancel_url: `${request.headers.get('origin')}/meus-anuncios?payment=cancel`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}