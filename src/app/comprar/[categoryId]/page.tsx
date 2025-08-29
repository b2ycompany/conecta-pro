// src/app/comprar/[categoryId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getListingsByCategory } from '@/lib/firestoreService'; // Importamos a nossa nova função
import { mainCategories } from '@/lib/categories';
import type { Listing } from '@/lib/types';
import { ListingCard } from '@/components/ui/ListingCard';
import { LoaderCircle, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function CategoryResultsPage() {
  const params = useParams<{ categoryId: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (params.categoryId) {
      const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
      
      const currentCategory = mainCategories.find(cat => cat.id === categoryId);
      setCategoryName(currentCategory ? currentCategory.name : 'Categoria Desconhecida');

      const fetchListings = async () => {
        setIsLoading(true);
        
        // ALTERAÇÃO: A chamada à base de dados agora está ativa!
        const results = await getListingsByCategory(categoryId);
        setListings(results);
        
        setIsLoading(false);
      };
      
      fetchListings();
    }
  }, [params.categoryId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <LoaderCircle size={48} className="animate-spin text-blue-600" />
        <p className="mt-4 text-lg">A buscar anúncios em <span className="font-bold">{categoryName}</span>...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary">
          Resultados para: <span className="text-blue-600">{categoryName}</span>
        </h1>
        <p className="text-lg text-text-secondary mt-2">
          {listings.length} anúncio(s) encontrado(s).
        </p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <SearchX size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary">Nenhum anúncio encontrado</h2>
          <p className="text-text-secondary mt-2">Ainda não há anúncios nesta categoria.</p>
          <Link href="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
            Voltar para a Página Inicial
          </Link>
        </div>
      )}
    </div>
  );
}