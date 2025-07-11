// src/app/mensagens/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Inbox, MessageSquare, ArrowRight } from 'lucide-react';
import { getUserConversas, type ConversationInfo } from '@/lib/firestoreService';

// Componente para um item da lista de conversas
function ConversationItem({ conversation }: { conversation: ConversationInfo }) {
  return (
    <Link href={`/mensagens/${conversation.id}`}>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-border hover:border-primary hover:shadow-md transition-all flex justify-between items-center cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-full">
            <MessageSquare className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-text-primary">Anúncio ID: {conversation.listingId}</p>
            <p className="text-sm text-text-secondary truncate italic">
              {conversation.lastMessage || 'Nenhuma mensagem ainda...'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary mb-1">
            {conversation.lastMessageTimestamp ? new Date(conversation.lastMessageTimestamp.seconds * 1000).toLocaleDateString('pt-BR') : ''}
          </p>
          <ArrowRight className="text-text-secondary" />
        </div>
      </div>
    </Link>
  );
}

export default function InboxPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return; // Espera a autenticação carregar

    if (user) {
      setIsLoading(true);
      getUserConversas(user.uid)
        .then(data => {
          setConversations(data);
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      // Se não há utilizador, redireciona para o login
      alert("Você precisa estar logado para ver suas mensagens.");
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <LoaderCircle size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary">Caixa de Entrada</h1>
        <p className="text-lg text-text-secondary mt-2">
          Todas as suas conversas num só lugar.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map((convo) => (
            <ConversationItem key={convo.id} conversation={convo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary">Nenhuma conversa encontrada</h2>
          <p className="text-text-secondary mt-2">Quando você iniciar uma conversa sobre um anúncio, ela aparecerá aqui.</p>
        </div>
      )}
    </div>
  );
}