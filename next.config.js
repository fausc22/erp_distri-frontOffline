const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
  
  // ✅ PRE-CACHE DE PÁGINAS CRÍTICAS
  additionalManifestEntries: [
    { url: '/inicio', revision: null },
    { url: '/ventas/RegistrarPedido', revision: null },
    { url: '/login', revision: null },
  ],
  
  runtimeCaching: [
    {
      // Páginas específicas offline
      urlPattern: /^https?:\/\/[^\/]+\/(inicio|ventas\/RegistrarPedido|login)(\?.*)?$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'offline-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      // Assets estáticos
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      // Chunks de JavaScript
      urlPattern: /\/_next\/.*\.js$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'js-chunks',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
});