// src/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Briefcase, LogIn, User, LogOut, ChevronDown, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mainCategories } from '@/lib/categories';

const navCategories = mainCategories.slice(0, 4); // Pega as 4 primeiras para o menu principal

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <Briefcase className="text-blue-600" />
            <span>B2Y Sales</span>
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {navCategories.map(cat => (
              <Link key={cat.id} href={`/comprar/${cat.id}`} className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">
                {cat.name}
              </Link>
            ))}
             <Link href="/comprar" className="text-sm font-medium text-blue-600 hover:underline">Ver todas</Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Bell size={20} className="text-text-secondary" /></button>
                    <div className="relative">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                        <User size={20} className="text-text-secondary" />
                        <span className="text-sm font-medium text-text-primary hidden sm:inline">{user.email}</span>
                        <ChevronDown size={16} className={`text-text-secondary transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isUserMenuOpen && (
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
                  <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-blue-600">Login</Link>
                  {/* Para uma experiência 100% imersiva, este link poderia apontar para /anuncios/novo */}
                  <Link href="/anuncios/novo" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm">Anunciar Grátis</Link>
                </>
              )}
            </div>
             {/* Botão de Menu para mobile */}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>
      </div>
      {/* Menu Mobile que desliza de cima */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                className="md:hidden bg-white border-t border-border"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
            >
                <nav className="flex flex-col p-4 gap-4">
                    {mainCategories.map(cat => (
                        cat.journeys.length > 0 &&
                        <Link key={cat.id} href={`/comprar/${cat.id}`} onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-text-secondary hover:text-blue-600">{cat.name}</Link>
                    ))}
                    <hr/>
                     {user ? (
                        <div className='flex flex-col gap-4'>
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-text-secondary hover:text-blue-600">Meu Dashboard</Link>
                            <button onClick={handleLogout} className="text-red-600 font-bold text-left">Sair</button>
                        </div>
                     ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-blue-600 text-white text-center font-medium px-4 py-2 rounded-md">Login / Anunciar</Link>
                     )}
                </nav>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}