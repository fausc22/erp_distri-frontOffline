// components/OfflineGuard.jsx - Simplificado sin redirecciones automáticas
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useConnection } from '../utils/ConnectionManager';
import { getAppMode } from '../utils/offlineManager';

export default function OfflineGuard({ children }) {
  const router = useRouter();
  const { isOnline, eventType } = useConnection();
  
  const isPWA = getAppMode() === 'pwa';

  // ✅ SOLO COMPONENTE PASIVO - NO REDIRECCIONES AUTOMÁTICAS
  useEffect(() => {
    if (!isPWA || !eventType) return;

    const currentPath = router.pathname;

    // ✅ Solo logging, sin redirecciones
    switch (eventType) {
      case 'connection_lost':
        console.log(`📴 Conexión perdida detectada en: ${currentPath}`);
        break;
        
      case 'connection_restored':
        console.log(`🌐 Conexión restaurada detectada en: ${currentPath}`);
        break;
        
      default:
        break;
    }
  }, [eventType, router.pathname, isPWA]);

  // ✅ NO HAY VERIFICACIONES INICIALES NI REDIRECCIONES
  // El componente simplemente pasa los children sin modificaciones
  
  return children;
}

// ✅ COMPONENTE SIMPLIFICADO PARA NAVBAR
export function NavbarGuard({ children }) {
  // El navbar siempre se muestra sin restricciones
  return children;
}

// ✅ COMPONENTE SIMPLIFICADO PARA ENLACES
export function LinkGuard({ href, children, className, ...props }) {
  const { isOnline, checkOnDemand } = useConnection();
  const isPWA = getAppMode() === 'pwa';
  
  const handleClick = async (e) => {
    // ✅ Solo verificar para rutas que requieren conexión estricta
    const routesRequireOnline = [
      '/inventario',
      '/compras', 
      '/finanzas',
      '/edicion'
    ];
    
    const requiresOnline = routesRequireOnline.some(route => href.includes(route));
    
    if (isPWA && requiresOnline) {
      e.preventDefault();
      
      // Verificar conexión en demanda
      const hayConexion = await checkOnDemand();
      
      if (hayConexion) {
        // Hay conexión, permitir navegación
        window.location.href = href;
      } else {
        // Sin conexión, mostrar advertencia
        if (typeof toast !== 'undefined') {
          toast.error('📴 Esta sección requiere conexión a internet', {
            duration: 3000,
            icon: '📴'
          });
        }
      }
      return false;
    }
    
    // Navegación normal para otras rutas
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
    const { isOnline, checkOnDemand } = useConnection();
    const router = useRouter();
    const isPWA = getAppMode() === 'pwa';
    const [checking, setChecking] = useState(false);

    // ✅ Solo verificar si la ruta específicamente no permite offline
    useEffect(() => {
      if (!isPWA || allowOffline) {
        return;
      }

      // Solo verificar para rutas que estrictamente requieren online
      const currentRoute = router.pathname;
      const strictOnlineRoutes = [
        '/inventario',
        '/compras',
        '/finanzas', 
        '/edicion'
      ];
      
      const needsStrictOnline = strictOnlineRoutes.some(route => currentRoute.includes(route));
      
      if (needsStrictOnline && !isOnline) {
        setChecking(true);
        
        // Verificar conexión una vez más
        checkOnDemand().then(hayConexion => {
          if (!hayConexion) {
            router.push('/inicio');
          }
          setChecking(false);
        });
      }
    }, [isOnline, router, allowOffline, checkOnDemand]);

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