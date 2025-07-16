const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
  
  // ✅ CACHE OBLIGATORIO DE TODAS LAS PÁGINAS CRÍTICAS
  additionalManifestEntries: [
    { url: '/ventas/RegistrarPedido', revision: null },
    { url: '/inicio', revision: null },
    { url: '/login', revision: null },
    { url: '/', revision: null },
  ],
  
  // ✅ ESTRATEGIA DE CACHE AGRESIVA PARA OFFLINE
  runtimeCaching: [
    {
      // ✅ PÁGINAS PRINCIPALES - CACHE FIRST AGRESIVO
      urlPattern: /^https?:\/\/[^\/]+\/(ventas\/RegistrarPedido|inicio|login|$)(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'critical-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // ✅ CHUNKS DE JAVASCRIPT CRÍTICOS - CACHE PERMANENTE
      urlPattern: /^https?:\/\/[^\/]+\/_next\/static\/chunks\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'js-chunks',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      // ✅ CSS Y ASSETS ESTÁTICOS - CACHE PERMANENTE
      urlPattern: /^https?:\/\/[^\/]+\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      // ✅ COMPONENTES ESPECÍFICOS DE PEDIDOS
      urlPattern: /^https?:\/\/[^\/]+\/_next\/static\/chunks\/pages\/(ventas|components).*\.js$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pedidos-components',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      // ✅ MANIFEST Y PWA ASSETS
      urlPattern: /^https?:\/\/[^\/]+\/(manifest\.json|favicon\.ico|.*\.png)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pwa-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      // ✅ FUENTES Y RECURSOS EXTERNOS
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
        },
      },
    },
    {
      // ✅ API CON FALLBACK OFFLINE INTELIGENTE
      urlPattern: /^https?:\/\/[^\/]+\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 día
        },
        networkTimeoutSeconds: 5, // Timeout rápido
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // ✅ FALLBACK GENERAL PARA OTRAS PÁGINAS
      urlPattern: /^https?:\/\/[^\/]+\/(?!api).*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        },
        networkTimeoutSeconds: 3, // Timeout muy rápido
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  
  // ✅ HEADERS PARA CACHE AGRESIVO
  async headers() {
    return [
      {
        source: '/ventas/RegistrarPedido',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/inicio',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 día
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
});
