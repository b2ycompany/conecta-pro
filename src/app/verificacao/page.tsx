// src/app/verificacao/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { LoaderCircle, ShieldCheck, Smartphone, KeyRound } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { auth } from '@/lib/firebase';
// CORREÇÃO: Importamos a biblioteca de animações
import { motion, AnimatePresence } from 'framer-motion';
// CORREÇÃO: Importamos a nossa função para atualizar o perfil no Firestore
import { updateUserPhoneVerification } from '@/lib/firestoreService';

// CORREÇÃO: Avisamos ao TypeScript que estas propriedades existem no 'window'
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha?: any;
  }
}

export default function VerificationPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recaptchaContainerRef.current && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA resolvido */ }
      });
      window.recaptchaVerifier.render(); // Renderiza o widget
    }
  }, []);

  const handleSendCode = async () => {
    setError('');
    setIsLoading(true);
    if (!window.recaptchaVerifier) {
        setError("Recaptcha não inicializado. Tente recarregar a página.");
        setIsLoading(false);
        return;
    }

    try {
      const numberToFormat = `+55${phoneNumber.replace(/\D/g, '')}`;
      setFormattedPhoneNumber(numberToFormat); // Guarda o número formatado para usar na verificação
      const confirmation = await signInWithPhoneNumber(auth, numberToFormat, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(`Falha ao enviar o código. Verifique o número e tente novamente.`);
      window.recaptchaVerifier.render().then((widgetId: any) => {
        window.grecaptcha?.reset(widgetId);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setIsLoading(true);
    if (!confirmationResult || !user) {
      setError("Confirmação não encontrada. Tente enviar o código novamente.");
      setIsLoading(false);
      return;
    }
    
    try {
      await confirmationResult.confirm(verificationCode);
      
      // CORREÇÃO: Agora, salvamos o status de verificado no perfil do utilizador!
      await updateUserPhoneVerification(user.uid, formattedPhoneNumber);

      alert("Número verificado com sucesso!");
      router.push('/dashboard');
    } catch (err: any) {
      setError("Código de verificação inválido.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex justify-center items-center"><LoaderCircle className="animate-spin"/></div>;
  }
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold mt-4">Verificação de Conta</h1>
            <p className="text-text-secondary mt-2">Aumente a segurança e a confiança da sua conta.</p>
          </div>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          
          <AnimatePresence mode="wait">
            {!confirmationResult ? (
              <motion.div key="step1" exit={{ opacity: 0, x: -50 }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="font-semibold text-sm">Número de telemóvel</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="p-3 bg-gray-100 rounded-l-md border border-r-0">+55</span>
                      <IMaskInput
                        mask="(00) 00000-0000"
                        id="phone"
                        placeholder="(11) 99999-8888"
                        onAccept={(value) => setPhoneNumber(String(value))}
                        className="w-full p-3 border rounded-r-md"
                      />
                    </div>
                  </div>
                  <button onClick={handleSendCode} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2">
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <Smartphone size={18} />}
                    Enviar Código SMS
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-4">
                  <p className="text-sm text-center">Enviámos um código de 6 dígitos para o número que termina em ...{phoneNumber.slice(-4)}</p>
                  <div>
                    <label htmlFor="code" className="font-semibold text-sm">Código de Verificação</label>
                    <input
                      type="text"
                      id="code"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full p-3 border rounded-md mt-1 tracking-[1em] text-center"
                    />
                  </div>
                  <button onClick={handleVerifyCode} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2">
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <KeyRound size={18} />}
                    Verificar Código
                  </button>
                  <button onClick={() => setConfirmationResult(null)} className="w-full text-sm text-center text-text-secondary hover:underline">
                    Usar outro número
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}