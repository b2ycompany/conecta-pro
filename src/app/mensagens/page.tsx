// src/app/mensagens/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Inbox, ArrowRight } from 'lucide-react';
import { getEnrichedUserConversas, type EnrichedConversation } from '@/lib/firestoreService';
import Image from 'next/image';

// Novo componente para um item da lista de conversas, agora mais rico
function ConversationItem({ conversation }: { conversation: EnrichedConversation }) {
  return (
    <Link href={`/mensagens/${conversation.id}`} className="block w-full">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-border hover:border-blue-600 hover:shadow-md transition-all flex items-center cursor-pointer gap-4">
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
          <Image 
            src={conversation.listing.imageUrl || '/placeholder.png'} 
            alt={conversation.listing.title} 
            fill 
            className="object-cover" 
            sizes="64px"
          />
        </div>
        <div className="flex-grow overflow-hidden">
          <p className="font-bold text-text-primary truncate" title={conversation.listing.title}>
            {conversation.listing.title}
          </p>
          <p className="text-sm text-text-secondary">
            Conversa com: <span className="font-semibold">{conversation.otherParticipant.name}</span>
          </p>
          <p className="text-sm text-text-secondary truncate italic mt-1">
            "{conversation.lastMessage || 'Nenhuma mensagem ainda...'}"
          </p>
        </div>
        <div className="text-right text-xs text-text-secondary flex-shrink-0 pl-2">
          <p className="mb-2">
            {conversation.lastMessageTimestamp?.seconds ? new Date(conversation.lastMessageTimestamp.seconds * 1000).toLocaleDateString('pt-BR') : '...'}
          </p>
          <ArrowRight className="ml-auto" />
        </div>
      </div>
    </Link>
  );
}

export default function InboxPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      setIsLoading(true);
      // Usamos a nova função para buscar os dados enriquecidos
      getEnrichedUserConversas(user.uid)
        .then(data => setConversations(data))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return <div className="min-h-[50vh] flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary">Caixa de Entrada</h1>
        <p className="text-lg text-text-secondary mt-2">
          {conversations.length > 0
            ? `Você tem ${conversations.length} conversas ativas.`
            : 'Você ainda não tem conversas.'}
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map((convo) => <ConversationItem key={convo.id} conversation={convo} />)}
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