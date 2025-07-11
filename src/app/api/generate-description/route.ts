// src/app/api/generate-description/route.ts

import { NextResponse } from 'next/server';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);

export async function POST(request: Request) {
  try {
    const { title, description, price, annualRevenue, profitMargin } = await request.json();

    const priceNum = Number(String(price).replace(/\./g, '').replace(',', '.')) || 0;
    const revenueNum = Number(String(annualRevenue).replace(/\./g, '').replace(',', '.')) || 0;
    const marginNum = Number(String(profitMargin).replace(',', '.')) / 100 || 0;

    let insights = [];
    if (revenueNum > 0 && marginNum > 0) {
        const annualProfit = revenueNum * marginNum;
        insights.push(`Com um faturamento de ${formatCurrency(revenueNum)} e margem de ${profitMargin}%, o lucro anual estimado é de ${formatCurrency(annualProfit)}.`);
        if (priceNum > 0 && annualProfit > 0) {
            const paybackSimple = priceNum / annualProfit;
            insights.push(`O retorno do investimento (payback simples), desconsiderando outros fatores, é de aproximadamente ${paybackSimple.toFixed(1)} anos, um indicador atrativo.`);
        }
    }
    insights.push("Este negócio representa uma excelente oportunidade de investimento com alto potencial de retorno, ideal para empreendedores que buscam um projeto sólido para crescer.");

    const enhancedTitle = `${title} - Oportunidade Única no Setor!`;
    const enhancedDescription = `**Descrição Original:**\n${description}\n\n**Análise e Otimização (B2Y IA):**\n${insights.join(' ')}`;
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ title: enhancedTitle, description: enhancedDescription });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao otimizar anúncio." }, { status: 500 });
  }
}