// src/components/ProtectedActionButton.tsx

'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

// Definimos as propriedades que o nosso botão irá aceitar
type ProtectedActionButtonProps = {
  children: ReactNode; // O conteúdo do botão (texto, ícone, etc.)
  onClick: () => void; // A função que será executada se o utilizador ESTIVER logado
} & ComponentProps<'button'>; // Permite passar qualquer outra propriedade de um botão normal (className, disabled, etc.)

/**
 * Um botão que só executa a função onClick se o utilizador estiver autenticado.
 * Caso contrário, redireciona o utilizador para a página de login, guardando a página atual
 * para que ele possa voltar após a autenticação.
 */
export default function ProtectedActionButton({ children, onClick, ...props }: ProtectedActionButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Hook do Next.js para obter o URL atual

  const handleInteraction = () => {
    // 1. Verifica se existe um utilizador logado
    if (user) {
      // Se sim, executa a função original que foi passada como propriedade
      onClick();
    } else {
      // 2. Se não houver utilizador, preparamos o redirecionamento
      console.log("Utilizador não autenticado. Redirecionando para login...");
      
      // Mensagem para o utilizador (opcional, mas bom para UX)
      alert("Para realizar esta ação, por favor, faça login ou crie uma conta.");

      // Constrói o URL de login, adicionando o parâmetro 'redirect' com a página atual
      const loginUrl = `/login?redirect=${pathname}`;

      // Redireciona o utilizador
      router.push(loginUrl);
    }
  };

  return (
    // O botão renderizado chama a nossa função 'handleInteraction' em vez da 'onClick' original
    // Passamos todas as outras props (como className, disabled, etc.) diretamente para o botão
    <button onClick={handleInteraction} {...props}>
      {children}
    </button>
  );
}