// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { FloatingContactButton } from "@/components/ui/FloatingContactButton";
import Footer from "@/components/layout/Footer";
// ALTERAÇÃO: Importamos o nosso novo Provider
import { SplashScreenProvider } from "@/contexts/SplashScreenContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2Y Business 2 You - Negócios e Investimentos",
  description: "A sua plataforma para comprar, vender e investir em negócios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          {/* ALTERAÇÃO: O SplashScreenProvider envolve tudo */}
          <SplashScreenProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <FloatingContactButton />
          </SplashScreenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}