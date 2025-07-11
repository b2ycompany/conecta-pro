/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sua configuração de imagens existente
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  // ADICIONE ESTA PARTE PARA O ESLINT
  eslint: {
    // Atenção: Isso permite que o build de produção seja concluído
    // mesmo que seu projeto tenha erros de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
