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
import { LoaderCircle, Building, DollarSign, MapPin, Users, Percent, Phone, MessageSquare, Bookmark } from 'lucide-react';
import type { Listing } from '@/lib/mockData';
import { saveListingForUser, removeSavedListing, isListingSaved, getOrCreateConversation } from '@/lib/firestoreService';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

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
            console.log("Nenhum documento encontrado com este ID!");
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

  const handleActionClick = async (action: 'chat' | 'phone' | 'save') => {
    if (!user) {
        alert('Para realizar esta ação, por favor, crie uma conta ou faça login.');
        router.push('/login');
        return;
    }
    
    if (action === 'chat') {
        if (!listing || !listing.ownerId) {
            alert("Erro: não foi possível encontrar os dados do vendedor.");
            return;
        }
        try {
            const conversationId = await getOrCreateConversation(listing.id, listing.ownerId, user.uid);
            router.push(`/mensagens/${conversationId}`);
        } catch (error) {
            console.error("Erro ao iniciar conversa:", error);
            alert("Não foi possível iniciar a conversa.");
        }

    } else if (action === 'save') {
        handleSaveToggle();
    } else {
        alert(`Ação de '${action}' para o utilizador ${user.email}!`);
    }
  }

  // CORREÇÃO: Função inteligente para formatar a localização
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
        <Link href="/" className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
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
                <p className="text-sm text-text-secondary flex items-center gap-2 mb-2"><Building size={14}/> {listing.sector}</p>
                <h1 className="text-4xl font-bold text-text-primary mb-2">{listing.title}</h1>
                <p className="text-lg text-text-secondary flex items-center gap-2 mb-6">
                  <MapPin size={18}/> 
                  {/* CORREÇÃO APLICADA AQUI */}
                  <span>{formatLocation(listing.location)}</span>
                </p>
                <div className="border-t border-border my-6"></div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Descrição</h2>
                <p className="text-text-secondary leading-relaxed">{listing.description}</p>
                <div className="border-t border-border my-6"></div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Métricas Principais</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-text-secondary">Faturamento Anual</p><p className="text-xl font-bold text-blue-600">{formatCurrency(listing.annualRevenue)}</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-text-secondary">Margem de Lucro</p><p className="text-xl font-bold text-blue-600">{formatPercentage(listing.profitMargin)}</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-text-secondary">Nº de Funcionários</p><p className="text-xl font-bold text-blue-600">{listing.employees}</p></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-24">
                <p className="text-text-secondary text-lg">Valor de Venda</p>
                <p className="text-4xl font-extrabold text-blue-600 mb-6">{formatCurrency(listing.price)}</p>
                <div className="space-y-3">
                  <button onClick={() => handleActionClick('chat')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <MessageSquare/> Enviar Mensagem
                  </button>
                  <button onClick={() => handleActionClick('phone')} className="w-full bg-gray-100 hover:bg-gray-200 text-text-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Phone/> Ver Telefone
                  </button>
                  <button 
                    onClick={() => handleActionClick('save')} 
                    disabled={isSaving}
                    className={`w-full border-2 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 ${
                      isSaved 
                        ? 'bg-green-600 text-white border-transparent' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {isSaving ? <LoaderCircle className="animate-spin" /> : <Bookmark/>}
                    {isSaved ? 'Salvo!' : 'Salvar Anúncio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}