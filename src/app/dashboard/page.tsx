// src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LoaderCircle, MessageSquare, Bookmark, List } from 'lucide-react';
import { getUserConversas, type ConversationInfo, getUserSavedListings, type SavedListingInfo, getUserCreatedListings } from '@/lib/firestoreService';
// CORREÇÃO: Alteramos a importação para usar a nossa fonte única da verdade para os tipos.
import type { Listing } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [savedListings, setSavedListings] = useState<SavedListingInfo[]>([]);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [createdListings, setCreatedListings] = useState<Listing[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      const fetchDashboardData = async () => {
        try {
          const [saved, convos, created] = await Promise.all([
            getUserSavedListings(user.uid),
            getUserConversas(user.uid),
            getUserCreatedListings(user.uid)
          ]);
          setSavedListings(saved);
          setConversations(convos);
          setCreatedListings(created);
        } catch (error) {
          console.error("Erro ao buscar dados do dashboard:", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchDashboardData();
    } else {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || isLoadingData) {
    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-text-primary">Meu Painel</h1>
        <p className="text-lg text-text-secondary mt-2">Bem-vindo de volta, {user?.displayName || user?.email}!</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><List className="text-blue-600"/> Meus Anúncios Publicados</h2>
            <div className="space-y-3">
              {createdListings.length > 0 ? createdListings.slice(0, 2).map(item => (
                <Link key={item.id} href={`/anuncios/${item.id}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover"/>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary truncate">{item.title}</p>
                    <p className="text-sm text-blue-600 font-semibold">{formatCurrency(Number(item.price))}</p>
                  </div>
                </Link>
              )) : <p className="text-sm text-text-secondary">Você ainda não publicou nenhum anúncio.</p>}
            </div>
            <Link href="/meus-anuncios" className="text-sm font-semibold text-blue-600 mt-4 block">Ver todos os meus anúncios →</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="bg-white p-6 rounded-lg shadow-sm border border-border">
             <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><MessageSquare className="text-blue-600"/> Mensagens Recentes</h2>
             <div className="space-y-3">
              {conversations.slice(0, 3).map(convo => (
                <Link key={convo.id} href={`/mensagens/${convo.id}`} className="block p-2 rounded-md hover:bg-gray-50">
                  <p className="font-semibold truncate">Conversa sobre anúncio</p>
                  <p className="text-sm text-text-secondary truncate italic">"{convo.lastMessage || 'Nenhuma mensagem ainda...'}"</p>
                </Link>
              ))}
              {conversations.length === 0 && <p className="text-sm text-text-secondary">Nenhuma mensagem recente.</p>}
            </div>
             <Link href="/mensagens" className="text-sm font-semibold text-blue-600 mt-4 block">Ver todas as mensagens →</Link>
          </motion.div>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><Bookmark className="text-blue-600"/> Anúncios Salvos</h2>
            <div className="space-y-3">
              {savedListings.length > 0 ? savedListings.slice(0, 4).map(item => (
                <Link key={item.id} href={`/anuncios/${item.id}`} className="block p-2 rounded-md hover:bg-gray-50">
                  <p className="font-semibold truncate text-sm">{item.title}</p>
                </Link>
              )) : <p className="text-sm text-text-secondary">Nenhum anúncio salvo.</p>}
            </div>
            <Link href="/meus-anuncios-salvos" className="text-sm font-semibold text-blue-600 mt-4 block">Ver todos →</Link>
           </motion.div>
        </div>

      </div>
    </div>
  );
}