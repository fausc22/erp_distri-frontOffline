const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
  
  // ✅ CONFIGURACIÓN SIMPLE PARA INTERCEPTAR RUTAS OFFLINE
  runtimeCaching: [
    {
      // Interceptar navegación a páginas específicas
      urlPattern: /\/(inicio|ventas\/RegistrarPedido)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      // Interceptar assets (JS, CSS)
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
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
});