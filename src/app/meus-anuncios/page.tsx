// src/app/meus-anuncios/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ListPlus, Edit, Trash2 } from 'lucide-react';
import { getUserCreatedListings, deleteListing } from '@/lib/firestoreService';
import type { Listing } from '@/lib/mockData';
import Link from 'next/link';
import { ListingCard } from '@/components/ui/ListingCard'; // Reutilizamos o nosso cartão de visualização

export default function MyListingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Função para buscar os anúncios, que pode ser chamada novamente após uma exclusão
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
                // Atualiza a lista de anúncios na tela após a exclusão
                fetchMyListings();
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
                <Link href="/anuncios/novo" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <ListPlus size={18}/> Criar Novo Anúncio
                </Link>
            </div>

            {myListings.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myListings.map(listing => (
                        <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-border flex flex-col">
                            {/* O cartão é para visualização e link */}
                            <ListingCard listing={listing} />
                            {/* A barra de ações é separada */}
                            <div className="flex border-t border-border">
                                <Link href={`/anuncios/editar/${listing.id}`} className="flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium text-text-secondary hover:bg-gray-50 rounded-bl-lg transition-colors">
                                    <Edit size={14} /> Editar
                                </Link>
                                <button onClick={() => handleDelete(listing.id, listing.title)} className="flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-br-lg transition-colors border-l border-border">
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                        </div>
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