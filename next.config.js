const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // IMPORTANTE: debe ser false en producción
  buildExcludes: [/middleware-manifest\.json$/]
});

module.exports = withPWA({
  reactStrictMode: true,
});