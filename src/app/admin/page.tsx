// src/app/admin/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPendingListings, updateListingStatus, getPendingCategorySuggestions, updateCategorySuggestionStatus, rejectListingWithMessage } from '@/lib/firestoreService';
import { RejectionModal } from '@/components/admin/RejectionModal';
import type { Listing, CategorySuggestion } from '@/lib/types';
import { LoaderCircle, Shield, Check, X, ExternalLink, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminPage() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<CategorySuggestion[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAdmin) {
        router.push('/');
      } else {
        setIsLoadingData(true);
        Promise.all([
          getPendingListings(),
          getPendingCategorySuggestions()
        ]).then(([listings, suggestions]) => {
          setPendingListings(listings);
          setPendingSuggestions(suggestions);
        }).finally(() => setIsLoadingData(false));
      }
    }
  }, [user, isAdmin, isAuthLoading, router]);

  const handleApprove = async (listingId: string) => {
    try {
        await updateListingStatus(listingId, 'approved');
        // A UI só é atualizada DEPOIS do sucesso da operação no banco
        setPendingListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
        // Mensagem de erro mais clara
        alert(`Erro ao aprovar o anúncio. Verifique as suas permissões e as regras do Firestore.`);
    }
  };
  
  const handleOpenRejectionModal = (listing: Listing) => {
    setSelectedListing(listing);
    setIsRejectionModalOpen(true);
  };

  const handleRejectSubmit = async (listingId: string, message: string) => {
    if (!user) return;
    try {
        await rejectListingWithMessage(listingId, user.uid, message);
        // A UI só é atualizada DEPOIS do sucesso da operação no banco
        setPendingListings(prev => prev.filter(l => l.id !== listingId));
        setIsRejectionModalOpen(false);
    } catch (error) {
        // Mensagem de erro mais clara
        alert(`Erro ao rejeitar o anúncio. Verifique as suas permissões e as regras do Firestore.`);
    }
  };

  const handleSuggestionStatusUpdate = async (suggestionId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateCategorySuggestionStatus(suggestionId, newStatus);
      // A UI só é atualizada DEPOIS do sucesso da operação no banco
      setPendingSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      // Mensagem de erro mais clara
      alert(`Erro ao atualizar o status da sugestão.`);
    }
  };

  if (isAuthLoading || isLoadingData) {
    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>;
  }
  
  if (!isAdmin) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
        <div>
            <div className="flex items-center gap-4 mb-8">
            <Shield size={32} className="text-blue-600" />
            <div>
                <h1 className="text-4xl font-bold">Painel de Administração</h1>
                <p className="text-text-secondary">Gestão de Conteúdo da Plataforma</p>
            </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-border">
                <h2 className="p-4 text-lg font-semibold border-b border-border">Anúncios Pendentes ({pendingListings.length})</h2>
                {pendingListings.length > 0 ? (
                    <ul className="divide-y divide-border">
                    {pendingListings.map(listing => (
                        <li key={listing.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-grow">
                                <Image src={listing.imageUrl} alt={listing.title} width={80} height={80} className="rounded-md object-cover hidden sm:block"/>
                                <div className="flex-grow">
                                <p className="font-bold text-lg">{listing.title}</p>
                                <p className="text-sm text-text-secondary">Categoria: {listing.category}</p>
                                <Link href={`/anuncios/${listing.id}`} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    Ver Anúncio <ExternalLink size={12} />
                                </Link>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                                <button onClick={() => handleApprove(listing.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-sm transition-transform hover:scale-110" aria-label="Aprovar"><Check size={20} /></button>
                                <button onClick={() => handleOpenRejectionModal(listing)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-sm transition-transform hover:scale-110" aria-label="Rejeitar"><X size={20} /></button>
                            </div>
                        </li>
                    ))}
                    </ul>
                ) : ( <div className="p-8 text-center text-text-secondary">Não há anúncios pendentes para revisão.</div> )}
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border">
            <h2 className="p-4 text-lg font-semibold border-b border-border flex items-center gap-2">
            <Lightbulb className="text-yellow-400" />
            Sugestões de Categorias ({pendingSuggestions.length})
            </h2>
            {pendingSuggestions.length > 0 ? (
            <ul className="divide-y divide-border">
                {pendingSuggestions.map(suggestion => (
                <li key={suggestion.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-grow">
                    <p className="font-bold text-lg">{suggestion.categoryName}</p>
                    <p className="text-sm text-text-secondary italic">"{suggestion.description || 'Sem descrição'}"</p>
                    <p className="text-xs text-gray-400 mt-1">Sugerido por: {suggestion.userName}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <button onClick={() => handleSuggestionStatusUpdate(suggestion.id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-sm" aria-label="Aprovar Sugestão"><Check size={20} /></button>
                    <button onClick={() => handleSuggestionStatusUpdate(suggestion.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-sm" aria-label="Rejeitar Sugestão"><X size={20} /></button>
                    </div>
                </li>
                ))}
            </ul>
            ) : (
            <div className="p-8 text-center text-text-secondary">
                Não há novas sugestões de categoria.
            </div>
            )}
        </div>
      </div>

      <RejectionModal 
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onSubmit={handleRejectSubmit}
        listing={selectedListing}
      />
    </>
  );
}