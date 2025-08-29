// src/contexts/SplashScreenContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define o que o nosso contexto irá fornecer
interface SplashScreenContextType {
  hasSplashScreenBeenShown: boolean;
  setSplashScreenShown: () => void;
}

// Cria o contexto
const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

// Cria o "Provedor" que irá guardar o estado e partilhá-lo com toda a aplicação
export const SplashScreenProvider = ({ children }: { children: ReactNode }) => {
  const [hasSplashScreenBeenShown, setHasSplashScreenBeenShown] = useState(false);

  // Esta função só permite que o estado mude de 'false' para 'true' uma vez
  const setSplashScreenShown = () => {
    setHasSplashScreenBeenShown(true);
  };

  return (
    <SplashScreenContext.Provider value={{ hasSplashScreenBeenShown, setSplashScreenShown }}>
      {children}
    </SplashScreenContext.Provider>
  );
};

// Cria um "Hook" personalizado para facilitar o uso do contexto noutras páginas
export const useSplashScreen = (): SplashScreenContextType => {
  const context = useContext(SplashScreenContext);
  if (!context) {
    throw new Error('useSplashScreen must be used within a SplashScreenProvider');
  }
  return context;
};