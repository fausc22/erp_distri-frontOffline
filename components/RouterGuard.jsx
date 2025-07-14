// components/RouterGuard.jsx - NUEVO COMPONENTE para proteger rutas offline
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAppMode, offlineManager } from '../utils/offlineManager';

export default function RouterGuard({ children }) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  
  const isPWA = getAppMode() === 'pwa';

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      handleOfflineRedirect();
    };
    
    const handleOnline = () => {
      setIsOnline(true);
      setRedirecting(false);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar al cargar
    if (!navigator.onLine) {
      handleOfflineRedirect();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router.pathname]);

  const handleOfflineRedirect = () => {
    if (!isPWA) return; // Solo PWA necesita redirección
    
    const currentPath = router.pathname;
    const allowedOfflinePaths = ['/offline-pedidos', '/login', '/'];
    
    // Si estamos en una ruta permitida offline, no redirigir
    if (allowedOfflinePaths.includes(currentPath)) return;
    
    // Verificar si tenemos catálogo para modo offline
    const hasOfflineCatalog = checkOfflineCatalog();
    
    if (hasOfflineCatalog) {
      console.log(`📱 Redirigiendo de ${currentPath} a /offline-pedidos (sin conexión)`);
      setRedirecting(true);
      router.push('/offline-pedidos');
    }
  };

  const checkOfflineCatalog = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    return clientes.length > 5 && productos.length > 5;
  };

  // Mostrar mensaje de redirección
  if (redirecting) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-orange-800 mb-2">
            📱 Modo Offline Detectado
          </h2>
          <p className="text-orange-700">
            Redirigiendo a página de pedidos offline...
          </p>
        </div>
      </div>
    );
  }

  return children;
}