// src/app/resultados/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListingCard, type Listing } from '@/components/ui/ListingCard';
import { LoaderCircle, SearchX, ArrowLeft } from 'lucide-react';

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = searchParams.toString();
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/anuncios?${query}`);
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Falha ao buscar anúncios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Oportunidades Encontradas</h1>
            <p className="text-text-secondary">Com base nos seus critérios, encontrámos {listings.length} resultados.</p>
          </div>
          {/* BOTÃO DE NOVA BUSCA ADICIONADO */}
          <button 
            onClick={() => router.push('/comprar')}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Fazer Nova Busca
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-text-secondary gap-3">
            <LoaderCircle size={32} className="animate-spin text-primary" />
            <span className="text-xl">A buscar as melhores oportunidades...</span>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-text-secondary gap-4 text-center border-2 border-dashed border-border rounded-lg">
            <SearchX size={48} className="text-gray-400" />
            <h2 className="text-2xl font-semibold text-text-primary">Nenhum resultado encontrado</h2>
            <p>Tente ajustar os seus filtros de busca para encontrar mais oportunidades.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>A carregar...</div>}>
            <ResultsPageContent />
        </Suspense>
    )
}