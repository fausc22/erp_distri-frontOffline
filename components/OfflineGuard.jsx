// components/OfflineGuard.jsx - Simplificado para redirección directa a /offline
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useConnection } from '../utils/ConnectionManager';
import { getAppMode } from '../utils/offlineManager';

export default function OfflineGuard({ children }) {
  const router = useRouter();
  const { isOnline, eventType } = useConnection();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const isPWA = getAppMode() === 'pwa';

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD SIMPLIFICADO
  useEffect(() => {
    if (!isPWA || !eventType || isRedirecting) return;

    const currentPath = router.pathname;

    switch (eventType) {
      case 'connection_lost_redirect':
        // Solo redirigir si NO está en /offline
        if (currentPath !== '/offline') {
          handleOfflineRedirect();
        }
        break;
        
      case 'connection_restored_normal':
        // Notificación normal de reconexión (no hacer nada especial)
        console.log('🌐 Conexión restaurada en página online');
        break;
        
      case 'connection_restored_show_button':
        // Evento manejado por la página /offline
        console.log('🔄 Evento para mostrar botón de reconexión');
        break;
        
      default:
        break;
    }
  }, [eventType, router.pathname, isPWA, isRedirecting]);

  // ✅ REDIRECCIÓN SIMPLIFICADA A /offline
  const handleOfflineRedirect = () => {
    if (isRedirecting) return;
    
    console.log('📴 Redirigiendo a página offline dedicada');
    setIsRedirecting(true);

    // ✅ REDIRECCIÓN INMEDIATA Y ROBUSTA
    setTimeout(() => {
      window.location.href = '/offline';
    }, 500);
  };

  // ✅ VERIFICACIÓN INICIAL SIMPLIFICADA
  useEffect(() => {
    if (!isPWA) return;

    const currentPath = router.pathname;
    
    // Si estamos offline, NO está en /offline ni en /login, redirigir
    if (!isOnline && currentPath !== '/offline' && currentPath !== '/login' && !isRedirecting) {
      console.log(`🚫 Offline detectado en ${currentPath}, redirigiendo a /offline`);
      handleOfflineRedirect();
    }
  }, [router.pathname, isOnline, isPWA, isRedirecting]);

  // ✅ MOSTRAR LOADING DURANTE REDIRECCIÓN
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-orange-800 mb-2">
            📴 Activando Modo Offline
          </h2>
          <p className="text-orange-600">
            Cargando página offline dedicada...
          </p>
        </div>
      </div>
    );
  }

  return children;
}

// ✅ COMPONENTE SIMPLIFICADO PARA NAVBAR (ya no necesita lógica compleja)
export function NavbarGuard({ children }) {
  // El navbar siempre se muestra, ya que /offline no usa layout
  return children;
}

// ✅ COMPONENTE SIMPLIFICADO PARA ENLACES
export function LinkGuard({ href, children, className, ...props }) {
  const { isOnline } = useConnection();
  const isPWA = getAppMode() === 'pwa';
  
  const handleClick = (e) => {
    // Si estamos offline en PWA, redirigir a /offline en lugar de bloquear
    if (isPWA && !isOnline && href !== '/offline') {
      e.preventDefault();
      window.location.href = '/offline';
      return false;
    }
    
    // Navegación normal
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

// ✅ HOC SIMPLIFICADO PARA PROTEGER PÁGINAS
export function withOfflineGuard(Component, options = {}) {
  const { allowOffline = false } = options;

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

      if (!allowOffline && !isOnline) {
        router.push('/offline');
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