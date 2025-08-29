// src/lib/formatters.ts

/**
 * Converte de forma segura uma string de moeda (ex: "150.000,00") ou um número para um tipo number.
 * @param value O valor a ser convertido.
 * @returns O valor como um número, ou NaN se a conversão falhar.
 */
export const parseCurrency = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  
  // Remove todos os caracteres não numéricos, exceto a vírgula, e depois troca a vírgula por ponto.
  const numericString = value.replace(/[^0-9,]+/g, "").replace(",", ".");
  return parseFloat(numericString);
};

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