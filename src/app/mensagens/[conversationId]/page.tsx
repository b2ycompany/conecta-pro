// src/app/mensagens/[conversationId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMessage, submitReviewAndRecalculateAverage } from '@/lib/firestoreService';
import { LoaderCircle, Send, Star } from 'lucide-react';
import { ReviewFormModal } from '@/components/ui/ReviewFormModal'; // Importamos o nosso novo modal

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, isLoading } = useMessages(params.conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [conversationData, setConversationData] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (params.conversationId) {
      const fetchConversationData = async () => {
        const docRef = doc(db, 'conversations', params.conversationId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConversationData(docSnap.data());
        } else {
          router.push('/mensagens');
        }
      };
      fetchConversationData();
    }
  }, [params.conversationId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      await sendMessage(params.conversationId, user.uid, newMessage);
      setNewMessage('');
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user || !user.name || !conversationData) {
        alert("Erro: não foi possível identificar os utilizadores.");
        return;
    }
    
    const otherUserId = conversationData.participantIds.find((id: string) => id !== user.uid);
    if (!otherUserId) {
        alert("Erro: não foi possível identificar o utilizador a ser avaliado.");
        return;
    }

    try {
        await submitReviewAndRecalculateAverage(otherUserId, {
            rating,
            comment,
            reviewerId: user.uid,
            reviewerName: user.name, // Usamos o nome do nosso AuthContext melhorado!
            listingId: conversationData.listingId
        });
        alert("Avaliação enviada com sucesso!");
    } catch (error) {
        alert("Ocorreu um erro ao enviar a sua avaliação.");
    }
  };
  
  const otherUser = conversationData?.participantIds.find((id: string) => id !== user?.uid);

 if (isLoading || !conversationData) {

    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
        <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold">Conversa</h1>
            {otherUser && (
                <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex items-center gap-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-3 rounded-lg"
                >
                    <Star size={16} /> Avaliar Utilizador
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === user?.uid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
              placeholder="Escreva a sua mensagem..."
            />
            <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg"><Send /></button>
          </form>
        </div>
      </div>
      
      {otherUser && (
        <ReviewFormModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmit={handleReviewSubmit}
            reviewedUserName={"este utilizador"} // Idealmente, buscaríamos o nome do outro utilizador
        />
      )}
    </>
  );
}