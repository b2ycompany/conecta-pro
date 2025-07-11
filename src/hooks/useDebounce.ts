// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

// Este hook recebe um valor e um tempo de atraso (delay)
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um temporizador que só vai atualizar o valor "atrasado"
    // depois que o tempo de 'delay' passar sem que o 'value' mude.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o temporizador se o 'value' ou o 'delay' mudarem antes do tempo
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}