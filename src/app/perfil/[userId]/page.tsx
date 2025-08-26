// src/app/perfil/[userId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile, getUserReviews, type Review } from '@/lib/firestoreService';
import { LoaderCircle, UserCircle, Star } from 'lucide-react';
import Image from 'next/image';

// Componente para exibir as estrelas de avaliação
const StarRating = ({ rating }: { rating: number }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center">
            {[...Array(totalStars)].map((_, index) => {
                const starClass = index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300';
                return <Star key={index} className={starClass} fill="currentColor" />;
            })}
            <span className="ml-2 text-xl font-bold text-text-primary">{rating.toFixed(1)}</span>
        </div>
    );
};

export default function UserProfilePage() {
    const params = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.userId) {
            const fetchData = async () => {
                try {
                    const [profileData, reviewsData] = await Promise.all([
                        getUserProfile(params.userId as string),
                        getUserReviews(params.userId as string)
                    ]);
                    setProfile(profileData);
                    setReviews(reviewsData);
                } catch (error) {
                    console.error("Erro ao carregar dados do perfil:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [params.userId]);

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600" /></div>;
    }

    if (!profile) {
        return <div className="min-h-screen flex justify-center items-center"><p>Perfil não encontrado.</p></div>;
    }

    return (
        <div className="bg-background min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Cabeçalho do Perfil */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-border flex flex-col sm:flex-row items-center gap-6">
                    <UserCircle size={80} className="text-gray-300 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-text-primary">{profile.profile?.name || 'Utilizador Anónimo'}</h1>
                        <div className="mt-2">
                           <StarRating rating={profile.averageRating || 0} />
                           <p className="text-sm text-text-secondary mt-1">({profile.reviewCount || 0} avaliações)</p>
                        </div>
                    </div>
                </div>

                {/* Lista de Avaliações */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Avaliações Recebidas</h2>
                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map(review => (
                            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-border">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-text-primary">{review.reviewerName}</p>
                                    <div className="flex items-center">
                                       {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill="currentColor" />)}
                                    </div>
                                </div>
                                <p className="text-text-secondary italic">"{review.comment}"</p>
                                <p className="text-right text-xs text-gray-400 mt-4">
                                    {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : ''}
                                </p>
                            </div>
                        )) : (
                            <div className="bg-white p-6 rounded-lg text-center text-text-secondary">
                                <p>Este utilizador ainda não recebeu nenhuma avaliação.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}