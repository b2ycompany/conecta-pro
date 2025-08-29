// src/app/anuncios/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoaderCircle, Building, DollarSign, MapPin, Users, Percent, Phone, MessageSquare, Bookmark, Car, Gauge, Calendar, Wrench } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { saveListingForUser, removeSavedListing, isListingSaved, getOrCreateConversation } from '@/lib/firestoreService';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
// ALTERAÇÃO: Importamos o nosso novo componente de botão protegido
import ProtectedActionButton from '@/components/ProtectedActionButton';

// Função auxiliar para converter strings (ex: "25,50") para números (ex: 25.50)
const parseNumericString = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numericString = value.replace(/[^0-9,]+/g, "").replace(",", ".");
    return parseFloat(numericString);
  }
  return NaN;
};

// Componente para detalhes de Negócios
const BusinessDetails = ({ listing }: { listing: Listing }) => {
  const annualRevenue = parseNumericString(listing.annualRevenue);
  const profitMargin = parseNumericString(listing.profitMargin);

  return (
    <>
      <h2 className="text-2xl font-bold text-text-primary mb-4">Métricas Principais</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-text-secondary">Faturamento Anual</p>
            <p className="text-xl font-bold text-blue-600">{!isNaN(annualRevenue) ? formatCurrency(annualRevenue) : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-text-secondary">Margem de Lucro</p>
            <p className="text-xl font-bold text-blue-600">{!isNaN(profitMargin) ? formatPercentage(profitMargin / 100) : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-text-secondary">Nº de Funcionários</p>
            <p className="text-xl font-bold text-blue-600">{listing.employees || 'N/A'}</p>
        </div>
      </div>
    </>
  );
};

// Componente para detalhes de Veículos
const VehicleDetails = ({ listing }: { listing: Listing }) => (
    <>
    <h2 className="text-2xl font-bold text-text-primary mb-4">Detalhes do Veículo</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg"><p className="flex items-center gap-2 text-sm text-text-secondary mb-1"><Car size={16}/> Marca</p><p className="font-bold">{listing.brand || 'N/A'}</p></div>
      <div className="bg-gray-50 p-4 rounded-lg"><p className="flex items-center gap-2 text-sm text-text-secondary mb-1"><Calendar size={16}/> Ano</p><p className="font-bold">{listing.year || 'N/A'}</p></div>
      <div className="bg-gray-50 p-4 rounded-lg"><p className="flex items-center gap-2 text-sm text-text-secondary mb-1"><Gauge size={16}/> Quilometragem</p><p className="font-bold">{listing.mileage ? `${listing.mileage.toLocaleString('pt-BR')} km` : 'N/A'}</p></div>
      <div className="bg-gray-50 p-4 rounded-lg col-span-2 md:col-span-3"><p className="flex items-center gap-2 text-sm text-text-secondary mb-1"><Wrench size={16}/> Condição</p><p className="font-bold">{listing.condition || 'N/A'}</p></div>
    </div>
  </>
);

export default function ListingDetailPage() { 
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      const fetchListing = async () => {
        setIsLoading(true);
        try {
          const listingDocRef = doc(db, 'listings', params.id as string);
          const docSnap = await getDoc(listingDocRef);

          if (docSnap.exists()) {
            const foundListing = { id: docSnap.id, ...docSnap.data() } as Listing;
            setListing(foundListing);
            if (foundListing.imageUrl) {
              setMainImage(foundListing.imageUrl);
            }
          } else {
            setListing(null);
          }
        } catch (error) {
          console.error('Falha ao buscar anúncio do Firestore:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchListing();
    }
  }, [params.id]);

  useEffect(() => {
    if (user && listing) {
      setIsSaving(true);
      isListingSaved(user.uid, listing.id).then(saved => {
        setIsSaved(saved);
        setIsSaving(false);
      });
    }
  }, [user, listing]);

  const handleSaveToggle = async () => {
    // A verificação de 'user' agora é feita pelo ProtectedActionButton,
    // mas mantemos aqui por segurança caso esta função seja chamada de outro lugar.
    if (!user || !listing) return;
    
    setIsSaving(true);
    try {
      if (isSaved) {
        await removeSavedListing(user.uid, listing.id);
        setIsSaved(false);
      } else {
        await saveListingForUser(user.uid, listing.id, listing.title);
        setIsSaved(true);
      }
    } catch (error) {
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // ALTERAÇÃO: Funções específicas para cada ação, que serão passadas ao botão protegido.
  const handleStartChat = async () => {
    if (!user || !listing || !listing.ownerId) return;
    try {
        const conversationId = await getOrCreateConversation(listing.id, listing.ownerId, user.uid);
        router.push(`/mensagens/${conversationId}`);
    } catch (error) {
        alert("Não foi possível iniciar a conversa.");
    }
  };

  const handleShowPhone = () => {
    if (!user || !listing) return;
    // Lógica para mostrar o telefone, que pode estar no perfil do anunciante
    alert("Funcionalidade de ver telefone a ser implementada.");
  };

  const formatLocation = (location: any): string => {
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location !== null) {
      return `${location.address || ''}, ${location.number || ''} - ${location.city || ''}, ${location.state || ''}`;
    }
    return 'Localização não informada';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <LoaderCircle size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background text-center p-4">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">Anúncio Não Encontrado</h1>
        <p className="text-text-secondary">O anúncio que você procura não existe ou foi removido.</p>
        <Link href="/" className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  const numericPrice = parseNumericString(listing.price);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-8">
            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg mb-4">
              <Image src={mainImage} alt={`Imagem principal de ${listing.title}`} fill sizes="100vw" className="object-cover" />
            </div>
            <div className="flex gap-2">
              {(listing.gallery || [listing.imageUrl]).map((img, index) => (
                img && <div key={index} className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${mainImage === img ? 'border-blue-600' : 'border-transparent'}`} onClick={() => setMainImage(img)}>
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill sizes="10vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                {listing.sector && <p className="text-sm text-text-secondary flex items-center gap-2 mb-2"><Building size={14}/> {listing.sector}</p>}
                <h1 className="text-4xl font-bold text-text-primary mb-2">{listing.title}</h1>
                <p className="text-lg text-text-secondary flex items-center gap-2 mb-6">
                  <MapPin size={18}/> 
                  <span>{formatLocation(listing.location)}</span>
                </p>
                <div className="border-t border-border my-6"></div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Descrição</h2>
                <p className="text-text-secondary leading-relaxed">{listing.description}</p>
                <div className="border-t border-border my-6"></div>
                
                {listing.category === 'negocios' && <BusinessDetails listing={listing} />}
                {listing.category === 'veiculos' && <VehicleDetails listing={listing} />}
                
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-24">
                <p className="text-text-secondary text-lg">Valor de Venda</p>
                <p className="text-4xl font-extrabold text-blue-600 mb-6">{!isNaN(numericPrice) ? formatCurrency(numericPrice) : 'A consultar'}</p>
                
                {/* ALTERAÇÃO: Substituímos os botões normais pelos ProtectedActionButtons */}
                <div className="space-y-3">
                  <ProtectedActionButton onClick={handleStartChat} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <MessageSquare/> Enviar Mensagem
                  </ProtectedActionButton>
                  <ProtectedActionButton onClick={handleShowPhone} className="w-full bg-gray-100 hover:bg-gray-200 text-text-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <Phone/> Ver Telefone
                  </ProtectedActionButton>
                  <ProtectedActionButton 
                    onClick={handleSaveToggle} 
                    disabled={isSaving}
                    className={`w-full border-2 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${ isSaved ? 'bg-green-600 text-white border-transparent' : 'border-gray-300 hover:bg-gray-50 text-gray-600' }`}
                  >
                    {isSaving ? <LoaderCircle className="animate-spin" /> : <Bookmark/>}
                    {isSaved ? 'Salvo!' : 'Salvar Anúncio'}
                  </ProtectedActionButton>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}