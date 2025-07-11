// src/app/meus-anuncios-salvos/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, Bookmark, ArrowRight } from 'lucide-react';
// CORREÇÃO: O nome correto da função é 'getUserSavedListings'
import { getUserSavedListings, type SavedListingInfo } from '@/lib/firestoreService';

export default function SavedListingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<SavedListingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      setIsLoading(true);
      // CORREÇÃO: Usando o nome correto da função
      getUserSavedListings(user.uid)
        .then(data => {
          setSavedListings(data);
        })
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
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary">Meus Anúncios Salvos</h1>
        <p className="text-lg text-text-secondary mt-2">
          {savedListings.length > 0 ? `Você tem ${savedListings.length} anúncios salvos.` : 'Você ainda não salvou nenhum anúncio.'}
        </p>
      </div>

      {savedListings.length > 0 ? (
        <div className="space-y-4">
          {savedListings.map((listing) => (
            <Link key={listing.id} href={`/anuncios/${listing.id}`}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-border hover:border-blue-600 hover:shadow-md transition-all flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <Bookmark size={16} />
                  <h2 className="font-bold text-lg text-text-primary">{listing.title}</h2>
                </div>
                <ArrowRight className="text-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <p className="text-text-secondary">Quando você salvar uma oportunidade, ela aparecerá aqui.</p>
          <Link href="/comprar" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
            Começar a procurar
          </Link>
        </div>
      )}
    </div>
  );
}