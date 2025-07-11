// src/app/mensagens/[conversationId]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useMessages } from '@/hooks/useMessages'; // 1. Importamos nosso novo hook
import { sendMessage } from '@/lib/firestoreService'; // Importamos a função de enviar mensagem

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const { user } = useAuth();

  // 2. Usamos o hook para obter as mensagens e o estado de carregamento em tempo real
  const { messages, isLoading } = useMessages(params.conversationId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      // 3. Chamamos a função de serviço para salvar a mensagem no Firestore
      await sendMessage(params.conversationId, user.uid, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar mensagem.");
    }
  };
  
  // Se o utilizador não estiver logado, ou o estado de auth estiver a carregar, não mostra nada
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoaderCircle size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 bg-white border-b border-border shadow-sm">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <div className="ml-4">
          <h1 className="font-bold text-text-primary">Chat da Negociação</h1>
          <p className="text-sm text-success">Online</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
            <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin text-primary"/></div>
        ) : (
            messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
                <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                <div 
                    className={`max-w-md p-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-text-primary border border-border rounded-bl-none'}`}
                >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 text-right ${isMe ? 'text-blue-200' : 'text-text-secondary'}`}>
                    {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                </div>
                </motion.div>
            );
            })
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 bg-input-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors shadow-sm">
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}