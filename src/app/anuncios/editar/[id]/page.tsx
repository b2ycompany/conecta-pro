// src/app/anuncios/editar/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { LoaderCircle, Send } from 'lucide-react';
import { getListingForEdit, updateListing } from '@/lib/firestoreService';
import { IMaskInput } from 'react-imask';

export default function EditListingPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { user, isLoading: isAuthLoading } = useAuth();
    
    // O estado do formulário começa como nulo até os dados serem carregados
    const [formData, setFormData] = useState<any>(null); 
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Busca os dados do anúncio para preencher o formulário
    useEffect(() => {
        if (params.id) {
            getListingForEdit(params.id as string)
                .then(data => {
                    // Garante que o anúncio existe e que o utilizador logado é o dono
                    if (data && user && data.ownerId === user.uid) {
                        setFormData(data);
                    } else {
                        alert("Anúncio não encontrado ou você não tem permissão para editá-lo.");
                        router.push('/meus-anuncios');
                    }
                })
                .finally(() => setIsLoadingData(false));
        }
    }, [params.id, user, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleMaskedInputChange = (value: any, name: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateListing(params.id as string, formData);
            alert("Anúncio atualizado com sucesso!");
            router.push(`/anuncios/${params.id}`);
        } catch (error) {
            alert("Ocorreu um erro ao atualizar o anúncio.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData || isAuthLoading || !formData) {
        return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600" /></div>;
    }

    // O formulário de edição será mais simples, focando nos campos principais por agora
    return (
        <div className="min-h-screen bg-background p-8 flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-8">Editar Anúncio</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="font-semibold">Título do Anúncio</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="font-semibold">Descrição</label>
                        <textarea name="description" rows={8} value={formData.description} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="font-semibold">Preço de Venda</label>
                        <IMaskInput
                            mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros
                            name="price"
                            value={String(formData.price)} // Converte para string para o IMask
                            onAccept={(value) => handleMaskedInputChange(value, 'price')}
                            className="w-full mt-1 p-2 border rounded-md"
                        />
                    </div>
                    {/* Adicionar mais campos para edição aqui no futuro */}
                    <div className="text-right pt-6">
                        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 ml-auto">
                            {isSubmitting ? <LoaderCircle className="animate-spin"/> : <Send size={16}/>}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}