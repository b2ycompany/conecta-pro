// src/app/anuncios/novo/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LoaderCircle, UploadCloud, XCircle, Building, Briefcase, Sparkles, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createListing } from '@/lib/firestoreService';
import Image from 'next/image';
import { IMaskInput } from 'react-imask';
import { useDebounce } from '@/hooks/useDebounce';

// Tipos para os dados
type Category = { id: string; name: string; };
type State = { id: number; sigla: string; nome: string; };
type City = { id: number; nome: string; };

const initialFormData = {
  listingType: '',
  title: '',
  sector: '',
  location: {
    cep: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  },
  price: '',
  description: '',
  annualRevenue: '',
  profitMargin: '',
  employees: '',
  monthlyCosts: {
    rent: '',
    utilities: '',
    payroll: '',
    others: ''
  }
};

export default function NewDynamicListingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('');

  const debouncedCep = useDebounce(formData.location.cep, 500);

  // Proteção da Rota
  useEffect(() => {
    if (!isAuthLoading && !user) {
      alert("Você precisa estar logado para aceder a esta página.");
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Busca de dados iniciais (categorias e estados)
  useEffect(() => {
    fetch('/api/categorias').then(res => res.json()).then(setCategories);
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json()).then(setStates);
  }, []);

  // Busca cidades quando o estado muda
  useEffect(() => {
    if (selectedState) {
      setCities([]);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json()).then(setCities);
    }
  }, [selectedState]);

  // Busca endereço com o CEP "atrasado"
  useEffect(() => {
    const cepDigits = debouncedCep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({ ...prev, location: { ...prev.location, address: data.logradouro, city: data.localidade, state: data.uf }}));
            setSelectedState(data.uf);
          }
        });
    }
  }, [debouncedCep]);

  // Handlers de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (['cep', 'number', 'complement'].includes(name)) {
        setFormData(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
    } else if (['rent', 'utilities', 'payroll', 'others'].includes(name)) {
        setFormData(prev => ({ ...prev, monthlyCosts: { ...prev.monthlyCosts, [name]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'state') setSelectedState(value);
  };
  const handleMaskedInputChange = (value: any, name: string) => {
    const keys = name.split('.');
    if (keys.length > 1 && keys[0] === 'monthlyCosts') {
        setFormData(prev => ({ ...prev, monthlyCosts: { ...prev.monthlyCosts, [keys[1]]: value }}));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Lógica de Upload de Imagens
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });
  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };

  // Lógica da IA
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
            body: JSON.stringify(formData),
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

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || files.length === 0 || !formData.listingType) {
      alert("Por favor, selecione o tipo de anúncio, preencha todos os campos obrigatórios e adicione pelo menos uma imagem.");
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        files.map(file => {
          const storage = getStorage();
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${file.name}`);
          return uploadBytesResumable(storageRef, file).then(() => getDownloadURL(storageRef));
        })
      );
      
      const dataToSave = { ...formData, imageUrl: imageUrls[0], gallery: imageUrls };
      const newListingId = await createListing(user.uid, dataToSave);
      setSubmissionSuccess(newListingId);
    } catch (error) {
      alert("Ocorreu um erro ao publicar o anúncio.");
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle size={48} className="animate-spin text-blue-600" /></div>;
  }
  
  if (submissionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-xl shadow-lg max-w-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-text-primary">Anúncio Publicado!</h2>
          <p className="text-text-secondary mt-2 mb-8">O seu anúncio já está no ar e pronto para receber propostas.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => { setFormData(initialFormData); setFiles([]); setSubmissionSuccess(null); }} className="font-semibold text-text-primary py-3 px-6 rounded-lg border-2 border-border hover:bg-gray-100 transition-colors">Criar Outro Anúncio</button>
            <button onClick={() => router.push(`/anuncios/${submissionSuccess}`)} className="font-semibold text-white py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700">Ver Meu Anúncio</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-border p-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Publicar uma Oportunidade</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <p className="font-semibold text-xl text-text-primary mb-4">1. Qual o seu objetivo?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...initialFormData, listingType: 'business_sale'})} className={`p-6 text-left rounded-lg border-2 flex items-center gap-4 transition-all ${formData.listingType === 'business_sale' ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' : 'border-border hover:border-blue-600'}`}>
                      <Building className="text-blue-600"/> <div><p className="font-bold">Vender um Negócio</p><p className="text-xs text-text-secondary">Venda sua empresa, loja, etc.</p></div>
                  </button>
                  <button type="button" onClick={() => setFormData({...initialFormData, listingType: 'investment_seek'})} className={`p-6 text-left rounded-lg border-2 flex items-center gap-4 transition-all ${formData.listingType === 'investment_seek' ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' : 'border-border hover:border-blue-600'}`}>
                      <Briefcase className="text-blue-600"/> <div><p className="font-bold">Buscar Investimento</p><p className="text-xs text-text-secondary">Para projetos ou expansão.</p></div>
                  </button>
              </div>
            </div>

            <AnimatePresence>
            {formData.listingType && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden pt-4 border-t">
                  
                  <div>
                    <p className="font-semibold text-xl mb-4 text-text-primary">2. Informações Gerais</p>
                    <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                      <div><label>Título do Anúncio</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required/></div>
                      <div><label>Categoria</label><select name="sector" value={formData.sector} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md bg-white" required><option value="">Selecione...</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-xl mb-4 text-text-primary">3. Localização</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2 border-l-2 border-blue-200">
                        <div className="md:col-span-1"><label className="text-sm">CEP</label><IMaskInput mask="00000-000" value={formData.location.cep} onAccept={(v) => handleInputChange({target: {name: 'cep', value:v}} as any)} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div className="md:col-span-2"><label className="text-sm">Rua</label><input value={formData.location.address} disabled className="w-full mt-1 p-2 border rounded-md bg-gray-100"/></div>
                        <div className="md:col-span-1"><label className="text-sm">Número</label><input name="number" value={formData.location.number} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required/></div>
                        <div className="md:col-span-2"><label className="text-sm">Complemento</label><input name="complement" value={formData.location.complement} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-xl mb-4 text-text-primary">4. Métricas Financeiras</p>
                    <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                      {formData.listingType === 'business_sale' ? (<div><label>Preço de Venda</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" onAccept={(v)=>handleMaskedInputChange(v,'price')} className="w-full mt-1 p-2 border rounded-md"/></div>) 
                                                               : (<div><label>Aporte Buscado</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" onAccept={(v)=>handleMaskedInputChange(v,'price')} className="w-full mt-1 p-2 border rounded-md"/></div>)}
                      <div><label>Faturamento Anual</label><IMaskInput mask={Number} radix="," thousandsSeparator="." scale={2} padFractionalZeros placeholder="R$ 0,00" onAccept={(v)=>handleMaskedInputChange(v,'annualRevenue')} className="w-full mt-1 p-2 border rounded-md"/></div>
                      <div><label>Margem de Lucro (%)</label><IMaskInput mask={Number} scale={2} max={100} placeholder="Ex: 25,50" onAccept={(v)=>handleMaskedInputChange(v,'profitMargin')} className="w-full mt-1 p-2 border rounded-md"/></div>
                      <div><label>Nº de Funcionários</label><input type="number" name="employees" value={formData.employees} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-xl mb-4 text-text-primary">5. Descrição e Imagens</p>
                    <div className="space-y-4 pl-2 border-l-2 border-blue-200">
                      <div>
                        <div className="flex justify-between items-center"><label className="font-semibold">Descrição Detalhada</label><button type="button" onClick={handleAIOptimization} disabled={isGenerating} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 flex items-center gap-1 disabled:opacity-50"><Sparkles size={14} />{isGenerating ? 'Otimizando...' : 'Otimizar com IA'}</button></div>
                        <textarea name="description" value={formData.description} rows={5} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required/>
                      </div>
                      <div>
                        <label className="font-semibold">Imagens (até 5)</label>
                        <div {...getRootProps()} className={`mt-2 flex justify-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-600 ${isDragActive ? 'border-blue-600 bg-blue-50' : ''}`}><input {...getInputProps()} capture="environment" /><div className="text-center"><UploadCloud className="mx-auto h-12 w-12 text-text-secondary"/><p className="text-sm text-text-secondary">Arraste e solte, <span className="font-semibold text-blue-600">procure</span> ou tire uma foto</p></div></div>
                        <aside className="mt-4 flex flex-wrap gap-2">{files.map(file => (<div key={file.name} className="relative w-24 h-24"><Image src={URL.createObjectURL(file)} alt={file.name} width={96} height={96} className="object-cover w-full h-full rounded"/><button type="button" onClick={() => removeFile(file.name)} className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700"><XCircle className="h-6 w-6"/></button></div>))}</aside>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right pt-6">
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:bg-gray-400 ml-auto">
                      {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send size={16} />}
                      {isSubmitting ? 'A Publicar...' : 'Publicar Anúncio'}
                    </button>
                  </div>
                </motion.div>
            )}
            </AnimatePresence>
        </form>
      </div>
    </div>
  );
}