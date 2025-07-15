const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
  
  // ✅ CACHE SOLO LA PÁGINA OFFLINE (esencial)
  additionalManifestEntries: [
    { url: '/offline', revision: null },
  ],
  
  // ✅ ESTRATEGIA DE CACHE MÍNIMA - next-pwa maneja el resto automáticamente
  runtimeCaching: [
    {
      // Solo asegurar que /offline esté siempre disponible
      urlPattern: /^https?:\/\/[^\/]+\/offline(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-page',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    // next-pwa maneja automáticamente:
    // - /_next/static/* (assets estáticos)
    // - Páginas principales
    // - JavaScript chunks
    // - CSS files
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  
  // ✅ NO NECESITAMOS redirects ni rewrites especiales
  // El ConnectionManager maneja las redirecciones en JavaScript
});