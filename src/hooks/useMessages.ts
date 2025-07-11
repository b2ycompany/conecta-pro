// src/hooks/useMessages.ts

'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

// Definimos o tipo de uma mensagem como ela virá do Firestore
export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp; // O timestamp do Firestore é um objeto específico
};

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
        setIsLoading(false);
        return;
    };

    // Criamos uma referência para a sub-coleção 'messages' dentro de uma conversa específica
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    // Criamos uma query para ordenar as mensagens pela data de envio
    const q = query(messagesRef, orderBy('timestamp'));

    // onSnapshot é o "ouvinte" em tempo real do Firestore.
    // Esta função é chamada automaticamente sempre que há uma nova mensagem.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar mensagens em tempo real:", error);
      setIsLoading(false);
    });

    // Retornamos a função 'unsubscribe' para que o "ouvinte" seja cancelado
    // quando o utilizador sair da página, evitando consumo desnecessário de recursos.
    return () => unsubscribe();
  }, [conversationId]); // O efeito é re-executado se o ID da conversa mudar

  return { messages, isLoading };
}