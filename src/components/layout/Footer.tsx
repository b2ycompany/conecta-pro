// src/components/layout/Footer.tsx

import Link from 'next/link';
import { Mail, Phone, Globe } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 text-text-secondary border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8 text-center">
            <p className="text-sm">
                Desenvolvido por <a href="https://group-tau.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">B2Y Lion Group</a>
            </p>
            <div className="flex justify-center items-center gap-6 mt-4">
                <a href="tel:+5511965520979" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                    <Phone size={14} />
                    (11) 96552-0979
                </a>
                <a href="mailto:b2ylion@gmail.com" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                    <Mail size={14} />
                    b2ylion@gmail.com
                </a>
            </div>
            <p className="text-xs mt-6 text-gray-400">
                B2Y Business 2 You &copy; {currentYear} - Todos os direitos reservados.
            </p>
        </div>
    </footer>
  );
}

export default Footer;