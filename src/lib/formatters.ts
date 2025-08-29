// src/lib/formatters.ts

export const parseCurrency = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  
  const numericString = value.replace(/[^0-9,]+/g, "").replace(",", ".");
  return parseFloat(numericString);
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};