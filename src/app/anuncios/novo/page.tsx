// src/app/anuncios/novo/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation'; // Adicionado useSearchParams
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LoaderCircle, UploadCloud, XCircle, ArrowLeft, CheckCircle, Sparkles, Building, Briefcase } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createListing } from '@/lib/firestoreService';
import Image from 'next/image';
import { IMaskInput } from 'react-imask';
import { useDebounce } from '@/hooks/useDebounce';
import { mainCategories } from '@/lib/categories';

// --- TIPOS DE DADOS ---
type Category = typeof mainCategories[0] | null;

type FormData = {
  listingType?: 'business_sale' | 'investment_seek';
  title?: string;
  description?: string;
  location: {
    cep: string;
    address: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  };
  monthlyCosts?: {
    rent: string;
    utilities: string;
    payroll: string;
    others: string;
  };
  [key: string]: any;
};

const initialFormData: FormData = {
  location: { cep: '', address: '', number: '', complement: '', city: '', state: '' },
  monthlyCosts: { rent: '', utilities: '', payroll: '', others: '' }
};

export default function NewListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para ler parâmetros da URL
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // CORREÇÃO: Busca CEP agora preenche todos os campos do formulário
  const debouncedCep = useDebounce(formData.location?.cep || '', 500);
  useEffect(() => {
    const cepDigits = debouncedCep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({ 
                ...prev, 
                location: { 
                    ...prev.location, 
                    address: data.logradouro, 
                    city: data.localidade, 
                    state: data.uf 
                }
            }));
          }
        });
    }
  }, [debouncedCep]);

  // NOVO: Lógica para pré-selecionar a categoria e re-hidratar o formulário após o login
  useEffect(() => {
    // Se a categoria foi passada na URL, seleciona-a
    const preselectedCategory = searchParams.get('category');
    if (preselectedCategory && !selectedCategory) {
      const category = mainCategories.find(c => c.id === preselectedCategory);
      if (category) setSelectedCategory(category);
    }

    // Se houver dados de anúncio pendentes no localStorage, carrega-os
    const pendingData = localStorage.getItem('pendingListingData');
    if (pendingData) {
      setFormData(JSON.parse(pendingData));
      localStorage.removeItem('pendingListingData'); // Limpa para não carregar de novo
    }
  }, [searchParams, selectedCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length > 1) {
        setFormData((prev) => ({
            ...prev,
            [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
        }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMaskedInputChange = (value: any, name: string) => {
    const keys = name.split('.');
    if (keys.length > 1) {
        setFormData((prev) => ({
            ...prev,
            [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
        }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => { setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5)) }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });
  const removeFile = (fileName: string) => setFiles(prev => prev.filter(file => file.name !== fileName));

  const handleAIOptimization = async () => {
    if (!formData.title && !formData.description) {
        alert("Por favor, preencha o título ou uma descrição básica primeiro.");
        return;
    }
    setIsGenerating(true);
    try {
        const response = await fetch('/api/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, categoryName: selectedCategory?.name }),
        });
        if (!response.ok) throw new Error("A API de IA falhou.");

        const data = await response.json();
        setFormData(prev => ({
            ...prev,
            title: data.title || prev.title,
            description: data.description || prev.description
        }));
    } catch (error) {
        console.error("Erro ao otimizar com IA:", error);
        alert("Não foi possível otimizar o anúncio no momento.");
    } finally {
        setIsGenerating(false);
    }
  };

  // CORREÇÃO: Botão "Publicar" agora funcional e com fluxo imersivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return alert("Erro: Categoria não selecionada.");

    // NOVO: Verifica se o utilizador está logado ANTES de tentar submeter
    if (!user) {
      alert("Para publicar, por favor, faça login ou crie uma conta. O seu anúncio será guardado.");
      // Guarda os dados atuais no localStorage
      localStorage.setItem('pendingListingData', JSON.stringify(formData));
      // Redireciona para o login, informando para onde voltar depois
      router.push(`/login?redirect=/anuncios/novo&category=${selectedCategory.id}`);
      return;
    }

    if (files.length === 0) return alert("Por favor, adicione pelo menos uma imagem.");
    if (selectedCategory.id === 'negocios' && !formData.listingType) return alert("Por favor, selecione se deseja vender ou buscar um investimento.");
    
    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        files.map(file => {
          const storage = getStorage();
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${file.name}`);
          return uploadBytesResumable(storageRef, file).then(() => getDownloadURL(storageRef));
        })
      );
      const dataToSave = { 
          ...formData, 
          category: selectedCategory.id, 
          categoryName: selectedCategory.name,
          imageUrl: imageUrls[0], 
          gallery: imageUrls 
      };
      const newListingId = await createListing(user.uid, dataToSave);
      setSubmissionSuccess(newListingId);
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      alert("Ocorreu um erro ao publicar o seu anúncio.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submissionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-xl shadow-lg max-w-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold">Anúncio Publicado!</h2>
          <p className="text-text-secondary mt-2 mb-8">O seu anúncio já está no ar e pronto para ser visto.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => { setSelectedCategory(null); setFormData(initialFormData); setFiles([]); setSubmissionSuccess(null); }} className="font-semibold py-3 px-6 rounded-lg border-2 hover:bg-gray-100">Criar Outro Anúncio</button>
            <button onClick={() => router.push(`/anuncios/${submissionSuccess}`)} className="font-semibold text-white py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700">Ver Meu Anúncio</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border p-8">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div key="selection" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
              <h1 className="text-3xl font-bold mb-2">O que você deseja anunciar?</h1>
              <p className="text-text-secondary mb-8">Escolha uma categoria para começar.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainCategories.map(category => (
                  <motion.div key={category.id} onClick={() => { setSelectedCategory(category); setFormData(initialFormData); }}
                    className="p-6 rounded-lg border-2 hover:border-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-4 transition-colors"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <category.icon size={32} className="text-blue-600" />
                    <div><p className="font-bold text-lg">{category.name}</p></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-sm text-text-secondary mb-6 hover:text-text-primary">
                <ArrowLeft size={16} /> Voltar para a seleção de categorias
              </button>
              <h1 className="text-3xl font-bold mb-8">
                Anunciar em: <span className="text-blue-600">{selectedCategory.name}</span>
              </h1>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {selectedCategory.id === 'negocios' && (
                  <div>
                    <p className="font-semibold text-xl text-text-primary mb-4">1. Qual o seu objetivo?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button type="button" onClick={() => setFormData({...formData, listingType: 'business_sale'})} className={`p-6 text-left rounded-lg border-2 flex items-center gap-4 transition-all ${formData.listingType === 'business_sale' ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' : 'border-border hover:border-blue-600'}`}>
                            <Building className="text-blue-600"/> <div><p className="font-bold">Vender um Negócio</p><p className="text-xs text-text-secondary">Venda sua empresa, loja, etc.</p></div>
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, listingType: 'investment_seek'})} className={`p-6 text-left rounded-lg border-2 flex items-center gap-4 transition-all ${formData.listingType === 'investment_seek' ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' : 'border-border hover:border-blue-600'}`}>
                            <Briefcase className="text-blue-600"/> <div><p className="font-bold">Buscar Investimento</p><p className="text-xs text-text-secondary">Para projetos ou expansão.</p></div>
                        </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-xl mb-4">Informações Gerais</p>
                  <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                    <div><label>Título do Anúncio</label><input name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                    <div>
                      <div className="flex justify-between items-center"><label>Descrição Detalhada</label><button type="button" onClick={handleAIOptimization} disabled={isGenerating} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 flex items-center gap-1 disabled:opacity-50"><Sparkles size={14} />{isGenerating ? 'Otimizando...' : 'Otimizar com IA'}</button></div>
                      <textarea name="description" value={formData.description || ''} rows={5} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-semibold text-xl mb-4">Localização</p>
                  {/* CORREÇÃO: Layout do formulário de localização melhorado */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-2 border-l-2 border-blue-200">
                    <div className="md:col-span-1"><label>CEP</label><IMaskInput mask="00000-000" value={formData.location.cep} onAccept={(v)=>handleInputChange({target:{name:'location.cep',value:v}} as any)} className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div className="md:col-span-3"><label>Rua</label><input value={formData.location.address || ''} disabled className="w-full mt-1 p-2 border rounded-md bg-gray-100"/></div>
                    <div className="md:col-span-1"><label>Número</label><input name="location.number" value={formData.location.number} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required/></div>
                    <div className="md:col-span-3"><label>Complemento</label><input name="location.complement" value={formData.location.complement} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div className="md:col-span-2"><label>Cidade</label><input value={formData.location.city || ''} disabled className="w-full mt-1 p-2 border rounded-md bg-gray-100"/></div>
                    <div className="md:col-span-2"><label>Estado</label><input value={formData.location.state || ''} disabled className="w-full mt-1 p-2 border rounded-md bg-gray-100"/></div>
                  </div>
                </div>
                
                <div>
                  <p className="font-semibold text-xl mb-4">Detalhes Específicos</p>
                  <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                    {selectedCategory.fields.map(field => (
                      <div key={field.name}>
                        <label>{field.label}</label>
                        {field.type === 'currency' && <IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" value={formData[field.name] || ''} onAccept={(v)=>handleMaskedInputChange(v, field.name)} className="w-full mt-1 p-2 border rounded-md" required={field.required} />}
                        {field.type === 'percentage' && <IMaskInput mask={Number} scale={2} max={100} placeholder="Ex: 25,50" value={formData[field.name] || ''} onAccept={(v)=>handleMaskedInputChange(v, field.name)} className="w-full mt-1 p-2 border rounded-md" required={field.required} />}
                        {field.type === 'number' && <input type="number" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required={field.required} />}
                        {field.type === 'text' && <input type="text" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required={field.required} />}
                        {field.type === 'date' && <input type="date" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required={field.required} />}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCategory.id === 'negocios' && (
                  <div>
                    <p className="font-semibold text-xl mb-4">Custos Mensais (Opcional)</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2 border-l-2 border-blue-200">
                        <div><label>Aluguel</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" value={formData.monthlyCosts?.rent} onAccept={(v)=>handleMaskedInputChange(v, 'monthlyCosts.rent')} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label>Serviços Públicos (Água, Luz, etc.)</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" value={formData.monthlyCosts?.utilities} onAccept={(v)=>handleMaskedInputChange(v, 'monthlyCosts.utilities')} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label>Folha de Pagamento</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" value={formData.monthlyCosts?.payroll} onAccept={(v)=>handleMaskedInputChange(v, 'monthlyCosts.payroll')} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label>Outros Custos</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" value={formData.monthlyCosts?.others} onAccept={(v)=>handleMaskedInputChange(v, 'monthlyCosts.others')} className="w-full mt-1 p-2 border rounded-md"/></div>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="font-semibold text-xl mb-4">Imagens (até 5)</p>
                  <div className="pl-2 border-l-2 border-blue-200">
                      <div {...getRootProps()} className={`mt-2 flex justify-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-600 transition-colors ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-border'}`}><input {...getInputProps()} /><div className="text-center"><UploadCloud className="mx-auto h-12 w-12 text-text-secondary"/><p className="text-sm text-text-secondary">Arraste e solte, ou <span className="font-semibold text-blue-600">procure</span> nos seus arquivos</p></div></div>
                      <aside className="mt-4 flex flex-wrap gap-2">{files.map(file => (<div key={file.name} className="relative w-24 h-24"><Image src={URL.createObjectURL(file)} alt={file.name} fill className="object-cover rounded"/><button type="button" onClick={()=>removeFile(file.name)} className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700"><XCircle className="h-6 w-6" /></button></div>))}</aside>
                  </div>
                </div>

                <div className="text-right pt-6"><button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:bg-gray-400 ml-auto">{isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send size={16} />}{isSubmitting ? 'A Publicar...' : 'Publicar Anúncio'}</button></div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}