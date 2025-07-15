// components/OfflineGuard.jsx - Protección de rutas y control de navegación offline
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useConnection } from '../utils/ConnectionManager';
import { getAppMode } from '../utils/offlineManager';

export default function OfflineGuard({ children }) {
  const router = useRouter();
  const { isOnline, eventType, eventData } = useConnection();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const isPWA = getAppMode() === 'pwa';

  // ✅ RUTAS PERMITIDAS EN MODO OFFLINE
  const allowedOfflineRoutes = [
    '/inicio',
    '/ventas/RegistrarPedido',
    '/login'
  ];

  // ✅ VERIFICAR SI LA RUTA ACTUAL ESTÁ PERMITIDA OFFLINE
  const isRouteAllowedOffline = (path) => {
    return allowedOfflineRoutes.some(route => {
      if (route === path) return true;
      if (route === '/inicio' && path.startsWith('/inicio')) return true;
      return false;
    });
  };

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD
  useEffect(() => {
    if (!isPWA || !eventType || isRedirecting) return;

    const currentPath = router.pathname;

    switch (eventType) {
      case 'connection_lost_redirect':
        handleOfflineRedirect(currentPath);
        break;
        
      case 'connection_restored_redirect':
        handleOnlineRedirect(currentPath);
        break;
        
      case 'connection_lost_working':
      case 'connection_restored_working':
        // No redirigir, solo notificar cambio de UI
        console.log(`🔄 UI change event: ${eventType}`);
        break;
        
      default:
        break;
    }
  }, [eventType, eventData, router.pathname, isPWA, isRedirecting]);

  // ✅ REDIRECCIÓN A MODO OFFLINE
  const handleOfflineRedirect = async (currentPath) => {
    if (isRedirecting) return;
    
    console.log(`📴 Manejando redirección offline desde ${currentPath}`);
    setIsRedirecting(true);

    try {
      // Si ya está en una ruta permitida offline, no redirigir
      if (isRouteAllowedOffline(currentPath)) {
        console.log(`✅ Ruta ${currentPath} permitida offline, no redirigir`);
        setIsRedirecting(false);
        return;
      }

      // Redirigir a inicio offline
      console.log('🏠 Redirigiendo a inicio offline...');
      await router.push('/inicio?mode=offline');
      
    } catch (error) {
      console.error('❌ Error en redirección offline:', error);
    } finally {
      setTimeout(() => setIsRedirecting(false), 2000);
    }
  };

  // ✅ REDIRECCIÓN A MODO ONLINE
  const handleOnlineRedirect = async (currentPath) => {
    if (isRedirecting) return;
    
    console.log(`🌐 Manejando redirección online desde ${currentPath}`);
    setIsRedirecting(true);

    try {
      // Si está en login, no redirigir
      if (currentPath === '/login') {
        setIsRedirecting(false);
        return;
      }

      // Recargar página para asegurar estado fresco
      console.log('🔄 Recargando página para modo online...');
      window.location.href = '/inicio';
      
    } catch (error) {
      console.error('❌ Error en redirección online:', error);
      // Fallback
      await router.push('/inicio');
    } finally {
      setTimeout(() => setIsRedirecting(false), 2000);
    }
  };

  // ✅ VERIFICACIÓN INICIAL DE RUTA AL MONTAR
  useEffect(() => {
    if (!isPWA) return;

    const currentPath = router.pathname;
    
    // Si estamos offline y en una ruta no permitida, redirigir
    if (!isOnline && !isRouteAllowedOffline(currentPath) && !isRedirecting) {
      console.log(`🚫 Ruta ${currentPath} no permitida offline`);
      handleOfflineRedirect(currentPath);
    }
  }, [router.pathname, isOnline, isPWA]);

  // ✅ INTERCEPTAR NAVEGACIÓN NO PERMITIDA
  useEffect(() => {
    if (!isPWA || isOnline) return;

    const handleRouteChangeStart = (url) => {
      // Si estamos offline y la nueva ruta no está permitida, cancelar
      if (!isRouteAllowedOffline(url)) {
        console.log(`🚫 Navegación a ${url} bloqueada en modo offline`);
        
        // Prevenir la navegación
        router.events.emit('routeChangeError');
        throw 'Navegación cancelada - Ruta no disponible offline';
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [isOnline, isPWA, router]);

  // ✅ MOSTRAR LOADING DURANTE REDIRECCIÓN
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isOnline ? '🌐 Conectando...' : '📴 Modo Offline'}
          </h2>
          <p className="text-gray-600">
            {isOnline ? 'Cargando modo online...' : 'Cargando modo offline...'}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

// ✅ COMPONENTE PARA BLOQUEAR NAVBAR EN MODO OFFLINE
export function NavbarGuard({ children, isOfflineMode = false }) {
  const { isOnline } = useConnection();
  const isPWA = getAppMode() === 'pwa';
  
  // Si estamos en PWA offline, ocultar/bloquear navbar
  if (isPWA && (!isOnline || isOfflineMode)) {
    return null; // Ocultar navbar completamente
  }
  
  return children;
}

// ✅ COMPONENTE PARA BLOQUEAR ENLACES EN MODO OFFLINE  
export function LinkGuard({ href, children, className, ...props }) {
  const { isOnline } = useConnection();
  const isPWA = getAppMode() === 'pwa';
  const router = useRouter();
  
  const allowedOfflineRoutes = [
    '/inicio',
    '/ventas/RegistrarPedido',
    '/login'
  ];
  
  const isRouteAllowedOffline = (path) => {
    return allowedOfflineRoutes.some(route => {
      if (route === path) return true;
      if (route === '/inicio' && path.startsWith('/inicio')) return true;
      return false;
    });
  };

  const handleClick = (e) => {
    // Si estamos offline en PWA y la ruta no está permitida
    if (isPWA && !isOnline && !isRouteAllowedOffline(href)) {
      e.preventDefault();
      
      toast.error('📴 Esta función no está disponible offline', {
        duration: 3000,
        icon: '🚫'
      });
      
      return false;
    }
    
    // Navegación normal
    if (props.onClick) {
      props.onClick(e);
    }
  };

  // Estilo deshabilitado para enlaces offline
  const disabledStyle = isPWA && !isOnline && !isRouteAllowedOffline(href) 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  return (
    <a
      href={href}
      className={`${className} ${disabledStyle}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

// ✅ HOC PARA PROTEGER PÁGINAS COMPLETAS
export function withOfflineGuard(Component, options = {}) {
  const {
    allowOffline = false,
    redirectTo = '/inicio?mode=offline',
    requiredOnline = false
  } = options;

  return function GuardedComponent(props) {
    const { isOnline } = useConnection();
    const router = useRouter();
    const isPWA = getAppMode() === 'pwa';
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      if (!isPWA) {
        setChecking(false);
        return;
      }

      // Verificar acceso según configuración
      if (requiredOnline && !isOnline) {
        router.push(redirectTo);
        return;
      }

      if (!allowOffline && !isOnline) {
        router.push(redirectTo);
        return;
      }

      setChecking(false);
    }, [isOnline, router]);

    if (checking) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando acceso...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// ✅ HOOK PARA VERIFICAR PERMISOS DE NAVEGACIÓN
export function useNavigationGuard() {
  const { isOnline } = useConnection();
  const router = useRouter();
  const isPWA = getAppMode() === 'pwa';

  const allowedOfflineRoutes = [
    '/inicio',
    '/ventas/RegistrarPedido', 
    '/login'
  ];

  const canNavigateTo = (path) => {
    if (!isPWA) return true;
    if (isOnline) return true;
    
    return allowedOfflineRoutes.some(route => {
      if (route === path) return true;
      if (route === '/inicio' && path.startsWith('/inicio')) return true;
      return false;
    });
  };

  const navigateIfAllowed = async (path) => {
    if (canNavigateTo(path)) {
      await router.push(path);
      return true;
    } else {
      toast.error('📴 Esta página no está disponible offline', {
        duration: 3000,
        icon: '🚫'
      });
      return false;
    }
  };

  return {
    canNavigateTo,
    navigateIfAllowed,
    isOnline,
    isPWA,
    allowedOfflineRoutes
  };
}