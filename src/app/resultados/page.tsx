// src/app/resultados/page.tsx

'use client';

import { Suspense, useState } from 'react'; // Importamos o useState
import { 
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Configure,
  Stats
} from 'react-instantsearch';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ui/ListingCard';
import type { Listing } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';
const algoliasearch = require('algoliasearch/lite');

// REMOVEMOS A INICIALIZAÇÃO DAQUI

// Componente de Resultado Personalizado (sem alterações)
function Hit({ hit }: { hit: any }) {
  const listingForCard: Listing = {
    id: hit.objectID,
    title: hit.title || '',
    price: hit.price || '0',
    imageUrl: hit.imageUrl || '',
    location: hit.location || { city: 'N/A', state: ''},
    description: hit.description || '',
    category: hit.category || '',
    ownerId: hit.ownerId || '',
    createdAt: hit.createdAt,
    status: hit.status || 'approved'
  };
  return <ListingCard listing={listingForCard} />;
}

// O Conteúdo da Página de Busca
function SearchPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const initialCategoryRefinement = searchParams.get('refine_category')?.split(',') || [];
    
    // ALTERAÇÃO: A inicialização do cliente agora é feita aqui dentro, com useState.
    // Isto garante que o código só é executado no navegador.
    const [searchClient] = useState(() =>
        algoliasearch(
            process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
            process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY || ''
        )
    );

    // Verificação de segurança para garantir que as chaves estão presentes
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY) {
        return <div className="text-center p-8">Erro de configuração: As chaves do Algolia não foram encontradas.</div>;
    }

    return (
        <InstantSearch 
            searchClient={searchClient} 
            indexName="listings"
            routing 
        >
            <Configure
                query={query}
                facetFilters={initialCategoryRefinement.map(cat => `category:${cat}`)}
            />
            
            <div className="max-w-7xl mx-auto p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* ... (O resto do seu JSX para a página de busca permanece igual) ... */}
                    <aside className="md:col-span-1">
                        <div className="sticky top-24 space-y-6">
                           <div>
                                <h3 className="font-semibold mb-2 text-text-primary">Pesquisar por Termo</h3>
                                <SearchBox 
                                    placeholder="Ex: Restaurante em Cotia" 
                                    className="w-full"
                                    classNames={{ 
                                        input: "w-full p-2 border rounded-md shadow-sm", 
                                        submitIcon: "hidden", 
                                        resetIcon: "hidden" 
                                    }}
                                />
                           </div>
                           <div>
                                <h3 className="font-semibold mb-2 text-text-primary">Categorias</h3>
                                <RefinementList 
                                  attribute="category" 
                                  classNames={{ 
                                      list: 'space-y-2', 
                                      label: 'flex items-center gap-2 cursor-pointer',
                                      checkbox: 'h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300',
                                      labelText: 'text-sm text-text-secondary',
                                      count: 'ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full'
                                  }}
                                />
                           </div>
                        </div>
                    </aside>

                    <main className="md:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                           <Stats classNames={{ 
                               root: 'text-sm text-text-secondary font-semibold',
                           }}/>
                        </div>

                        <Hits 
                            hitComponent={Hit} 
                            classNames={{
                                root: 'min-h-[500px]',
                                list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
                                item: 'list-none'
                            }} 
                        />

                        <div className="mt-8 flex justify-center">
                            <Pagination classNames={{
                                list: 'flex items-center gap-1 sm:gap-2',
                                link: 'p-1',
                                pageItem: 'px-3 py-1 rounded-md text-sm hover:bg-gray-100',
                                selectedItem: 'bg-blue-600 text-white font-bold hover:bg-blue-600',
                                disabledItem: 'opacity-50 cursor-not-allowed',
                            }} />
                        </div>
                    </main>
                </div>
            </div>
        </InstantSearch>
    );
}

// A página final (sem alterações)
export default function ResultadosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>}>
      <SearchPageContent />
    </Suspense>
  )
}