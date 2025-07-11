// src/lib/formatters.ts

/**
 * Formata um número como moeda brasileira (R$).
 * @param value O número a ser formatado.
 * @returns A string formatada, ex: "R$ 180.000,00".
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata um número como uma percentagem.
 * @param value O número a ser formatado (ex: 0.25).
 * @returns A string formatada, ex: "25%".
 */
export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};