// src/app/meus-anuncios/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ListPlus } from 'lucide-react';
import { getUserCreatedListings, deleteListing } from '@/lib/firestoreService';
import type { Listing } from '@/lib/types'; // Import corrigido
import Link from 'next/link';
import { MyListingCard } from '@/components/ui/MyListingCard'; // ALTERAÇÃO: Usamos o MyListingCard

export default function MyListingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const fetchMyListings = useCallback(() => {
        if (user) {
            setIsLoadingData(true);
            getUserCreatedListings(user.uid)
                .then(data => setMyListings(data))
                .catch(err => console.error(err))
                .finally(() => setIsLoadingData(false));
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthLoading) {
            if (user) {
                fetchMyListings();
            } else {
                router.push('/login');
            }
        }
    }, [user, isAuthLoading, router, fetchMyListings]);

    const handleDelete = async (listingId: string, listingTitle: string) => {
        if (window.confirm(`Tem a certeza que deseja excluir o anúncio "${listingTitle}"? Esta ação não pode ser desfeita.`)) {
            try {
                await deleteListing(listingId);
                fetchMyListings(); // Recarrega a lista para refletir a exclusão
                alert("Anúncio excluído com sucesso.");
            } catch (error) {
                alert("Ocorreu um erro ao excluir o anúncio.");
            }
        }
    };

    if (isLoadingData || isAuthLoading) {
        return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600"/></div>
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary">Meus Anúncios</h1>
                    <p className="text-lg text-text-secondary mt-2">Gira, edite ou exclua os seus anúncios publicados.</p>
                </div>
                <Link href="/anuncios/novo" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <ListPlus size={18}/> Criar Novo Anúncio
                </Link>
            </div>

            {myListings.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myListings.map(listing => (
                        // ALTERAÇÃO: Renderizamos o MyListingCard que contém toda a lógica de status e ações
                        <MyListingCard 
                            key={listing.id} 
                            listing={listing} 
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                    <h2 className="text-2xl font-semibold text-text-primary">Você ainda não publicou nenhum anúncio.</h2>
                    <p className="text-text-secondary mt-2">Que tal começar agora?</p>
                </div>
            )}
        </div>
    );
}