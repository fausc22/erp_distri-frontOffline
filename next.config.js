const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
  
  // ✅ CACHE OBLIGATORIO DE REGISTRAR PEDIDO Y DEPENDENCIAS
  additionalManifestEntries: [
    { url: '/ventas/RegistrarPedido', revision: null },
    { url: '/inicio', revision: null },
    { url: '/login', revision: null },
  ],
  
  // ✅ ESTRATEGIA DE CACHE ROBUSTA PARA PWA OFFLINE
  runtimeCaching: [
    {
      // ✅ CACHE OBLIGATORIO: RegistrarPedido siempre disponible
      urlPattern: /^https?:\/\/[^\/]+\/ventas\/RegistrarPedido(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'registrar-pedido-page',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // ✅ CACHE OBLIGATORIO: Páginas principales
      urlPattern: /^https?:\/\/[^\/]+\/(inicio|login)(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'main-pages',
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // ✅ CACHE DE COMPONENTES CRÍTICOS
      urlPattern: /^https?:\/\/[^\/]+\/_next\/static\/chunks\/pages\/(ventas\/RegistrarPedido|inicio|login).*\.js$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'critical-page-chunks',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      // ✅ CACHE DE ASSETS ESTÁTICOS (CSS, JS, imágenes)
      urlPattern: /^https?:\/\/[^\/]+\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      // ✅ CACHE DE FUENTES Y RECURSOS EXTERNOS
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
      // ✅ ESTRATEGIA PARA API: NetworkFirst con fallback
      urlPattern: /^https?:\/\/[^\/]+\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 día
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // ✅ FALLBACK PARA OTRAS PÁGINAS (NetworkFirst)
      urlPattern: /^https?:\/\/[^\/]+\/(?!api).*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        },
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  
  // ✅ HEADERS PARA PWA OFFLINE
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
    ];
  },
});