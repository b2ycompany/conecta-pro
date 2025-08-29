// src/app/login/page.tsx

'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, LoaderCircle, User, Briefcase, DollarSign, Building, LogIn as LogInIcon, UserPlus } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { saveUserProfile } from '@/lib/firestoreService';
import type { UserProfile } from '@/lib/types';

// O tipo do formulário agora tem profileType como opcional
type FullFormData = Omit<UserProfile, 'email' | 'phoneVerified' | 'phoneNumber'> & {
    profileType?: 'seller' | 'buyer' | 'investor' | 'broker';
};

// CORREÇÃO: Alterado de 'null' para 'undefined' para corresponder ao novo tipo
const initialFormData: Partial<FullFormData> = {
    profileType: undefined, 
    name: '', 
    document: '', 
    phone: '', 
    cep: '', 
    address: '', 
    number: '',
    city: '', 
    state: ''
};

function AuthPageContent() {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [signupStep, setSignupStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, signup, login } = useAuth();
    const [formData, setFormData] = useState<Partial<FullFormData>>(initialFormData);

    useEffect(() => {
        const cepDigits = formData.cep?.replace(/\D/g, '');
        if (cepDigits?.length === 8) {
            fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        setFormData(prev => ({ 
                            ...prev, 
                            address: data.logradouro, 
                            city: data.localidade, 
                            state: data.uf 
                        }));
                    }
                })
                .catch(err => console.error("Erro ao buscar CEP:", err));
        }
    }, [formData.cep]);

    const handleMaskedInputChange = (value: any, fieldName: keyof FullFormData) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value as any }));
    };
    
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const form = new FormData(event.currentTarget);
        const email = form.get('email') as string;
        const password = form.get('password') as string;

        try {
            const { isAdmin } = await login(email, password);
            const redirectPath = searchParams.get('redirect');
            
            if (redirectPath) {
                const category = searchParams.get('category');
                const finalPath = category ? `${redirectPath}?category=${category}` : redirectPath;
                router.push(finalPath);
            } else if (isAdmin) {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError('Email ou palavra-passe inválidos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupStep1 = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
        const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

        try {
            await signup(email, password, {});
            setLoading(false);
            setSignupStep(2);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso.');
            } else {
                setError('Ocorreu um erro. Verifique se a palavra-passe tem pelo menos 6 caracteres.');
            }
            setLoading(false);
        }
    };
    
    const handleProfileSubmit = async () => {
        if (!user) {
            alert("Sessão não encontrada. Por favor, tente fazer login.");
            setAuthMode('login');
            setSignupStep(1);
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await saveUserProfile(user.uid, formData);
            const redirectPath = searchParams.get('redirect');
            if (redirectPath) {
                const category = searchParams.get('category');
                const finalPath = category ? `${redirectPath}?category=${category}` : redirectPath;
                router.push(finalPath);
            } else {
                switch (formData.profileType) {
                    case 'seller': router.push('/anuncios/novo'); break;
                    case 'buyer': router.push('/comprar'); break;
                    case 'investor': router.push('/investir'); break;
                    default: router.push('/dashboard'); break;
                }
            }
        } catch (error) {
            setError("Não foi possível salvar seu perfil. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const renderSignupStep = () => {
        switch (signupStep) {
            case 1:
                return (
                    <motion.form key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleSignupStep1}>
                        <h2 className="text-xl font-semibold text-center text-text-primary">Passo 1: Crie o seu acesso</h2>
                        <div><label className="text-sm font-medium text-text-primary">Email</label><input name="email" type="email" required disabled={loading} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Palavra-passe (mín. 6 caracteres)</label><input name="password" type="password" required disabled={loading} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm"/></div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? <LoaderCircle className="animate-spin"/> : 'Continuar'}
                        </button>
                    </motion.form>
                );
            case 2:
                return (
                     <motion.div key={2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <h2 className="text-xl font-semibold mb-6 text-text-primary">Passo 2: Qual o seu objetivo principal?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => { setFormData(p=>({...p, profileType:'seller'})); setSignupStep(3);}} className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 cursor-pointer text-text-primary"><Briefcase className="mx-auto mb-2 text-primary"/>Vender</div>
                            <div onClick={() => { setFormData(p=>({...p, profileType:'buyer'})); setSignupStep(3);}} className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 cursor-pointer text-text-primary"><Building className="mx-auto mb-2 text-primary"/>Comprar</div>
                            <div onClick={() => { setFormData(p=>({...p, profileType:'investor'})); setSignupStep(3);}} className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 cursor-pointer text-text-primary"><DollarSign className="mx-auto mb-2 text-primary"/>Investir</div>
                            <div onClick={() => { setFormData(p=>({...p, profileType:'broker'})); setSignupStep(3);}} className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 cursor-pointer text-text-primary"><User className="mx-auto mb-2 text-primary"/>Corretor</div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div key={3} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-text-primary">Passo Final: Complete o seu perfil</h2>
                        <div><label className="text-sm font-medium text-text-primary">Nome Completo</label><input name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border border-border rounded-md"/></div>
                        <div><label className="text-sm font-medium text-text-primary">CPF/CNPJ</label><IMaskInput mask={[{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }]} value={formData.document || ''} onAccept={(value) => handleMaskedInputChange(value, 'document')} className="mt-1 w-full p-2 border border-border rounded-md"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Telefone</label><IMaskInput mask="(00) 00000-0000" value={formData.phone || ''} onAccept={(value) => handleMaskedInputChange(value, 'phone')} className="mt-1 w-full p-2 border border-border rounded-md"/></div>
                        <div><label className="text-sm font-medium text-text-primary">CEP</label><IMaskInput mask="00000-000" value={formData.cep || ''} onAccept={(value) => handleMaskedInputChange(value, 'cep')} className="mt-1 w-full p-2 border border-border rounded-md"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Rua</label><input name="address" value={formData.address || ''} disabled className="mt-1 w-full p-2 border rounded-md bg-gray-100"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Número</label><input name="number" value={formData.number || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border border-border rounded-md"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Cidade</label><input value={formData.city || ''} disabled className="mt-1 w-full p-2 border rounded-md bg-gray-100"/></div>
                        <div><label className="text-sm font-medium text-text-primary">Estado</label><input value={formData.state || ''} disabled className="mt-1 w-full p-2 border rounded-md bg-gray-100"/></div>
                        <button onClick={handleProfileSubmit} disabled={loading} className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                           {loading ? <LoaderCircle className="animate-spin" /> : 'Concluir Cadastro'}
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md m-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text-primary">{authMode === 'login' ? 'Bem-vindo de volta!' : 'Cadastro Inteligente'}</h1>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle size={18} /><span>{error}</span></div>}

                <AnimatePresence mode="wait">
                    {authMode === 'signup' ? renderSignupStep() : (
                        <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleLogin}>
                            <div><label htmlFor="email-login" className="text-sm font-medium text-text-primary">Endereço de email</label><input id="email-login" name="email" type="email" autoComplete='email' required disabled={loading} className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border rounded-md shadow-sm disabled:opacity-50"/></div>
                            <div><label htmlFor="password-login" className="text-sm font-medium text-text-primary">Palavra-passe</label><input id="password-login" name="password" type="password" autoComplete="current-password" required disabled={loading} className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border rounded-md shadow-sm disabled:opacity-50"/></div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                                {loading ? <LoaderCircle className="animate-spin"/> : <LogInIcon size={16} />}
                                {loading ? 'A entrar...' : 'Entrar'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="text-center">
                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSignupStep(1); }} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'} <ArrowRight size={14} className="inline ml-1"/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>A carregar...</div>}>
            <AuthPageContent />
        </Suspense>
    )
}