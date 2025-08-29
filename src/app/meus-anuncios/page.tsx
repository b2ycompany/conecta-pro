// src/app/meus-anuncios/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ListPlus } from 'lucide-react';
import { getUserCreatedListings, deleteListing } from '@/lib/firestoreService';
import type { Listing } from '@/lib/types';
import Link from 'next/link';
import { MyListingCard } from '@/components/ui/MyListingCard';

export default function MyListingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false); // NOVO ESTADO: para o loading do checkout

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
    
    // NOVA FUNÇÃO: Para lidar com o clique em "Destacar"
    const handleFeature = async (listingId: string, listingTitle: string) => {
        setIsRedirecting(true); // Ativa o ecrã de loading
        try {
            // Chama a sua API interna para criar a sessão de checkout
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, listingTitle }),
            });

            if (!response.ok) {
                throw new Error('Falha ao criar sessão de checkout');
            }

            const { url } = await response.json();
            // Redireciona o utilizador para a página de pagamento do Stripe
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('URL de checkout não recebida.');
            }

        } catch (error) {
            console.error("Erro no processo de destaque:", error);
            alert("Ocorreu um erro ao iniciar o processo de destaque. Por favor, tente novamente.");
            setIsRedirecting(false); // Desativa o loading em caso de erro
        }
    };
    
    // Mostra uma mensagem de loading durante o processo de autenticação ou busca de dados
    if (isLoadingData || isAuthLoading) {
        return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600"/></div>
    }

    // Mostra um ecrã de loading específico para o redirecionamento para o Stripe
    if (isRedirecting) {
        return <div className="min-h-screen flex flex-col justify-center items-center gap-4"><LoaderCircle size={48} className="animate-spin text-blue-600"/> <p className="text-lg text-text-secondary">A redirecionar para o pagamento...</p></div>
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
                        <MyListingCard 
                            key={listing.id} 
                            listing={listing} 
                            onDelete={handleDelete}
                            onFeature={handleFeature} // Passamos a nova função para o componente filho
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