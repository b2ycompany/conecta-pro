// src/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Briefcase, LogIn, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const handleVenderClick = () => {
    if (isLoading) return; 

    if (user) {
      // CORREÇÃO: Apontando para a rota correta no PLURAL
      router.push('/anuncios/novo');
    } else {
      router.push('/login?journey=sell');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <Briefcase className="text-blue-600" />
            <span>B2Y Business 2 You</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link href="/comprar" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">Comprar</Link>
            <Link href="/investir" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">Investir</Link>
            <button onClick={handleVenderClick} className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">Vender</button>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Bell size={20} className="text-text-secondary" /></button>
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                    <User size={20} className="text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary hidden sm:inline">{user.email}</span>
                    <ChevronDown size={16} className={`text-text-secondary transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-border z-50">
                        <div className="p-4 border-b border-border"><p className="text-sm font-semibold text-text-primary">Minha Conta</p><p className="text-xs text-text-secondary truncate">{user.email}</p></div>
                        <ul className="py-1">
                          <li><Link href="/dashboard" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100">Meu Dashboard</Link></li>
                          <li><Link href="/meus-anuncios-salvos" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100">Anúncios Salvos</Link></li>
                          <li><Link href="/mensagens" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100">Mensagens</Link></li>
                          <li><Link href="/meus-anuncios" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100">Meus Anúncios</Link></li>
                          <li><hr className="my-1 border-border" /></li>
                          <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={16} /> Sair</button></li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors hidden sm:flex items-center gap-2"><LogIn size={16} />Login</Link>
                <button onClick={handleVenderClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm">Anunciar Grátis</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}