// components/AppInitializer.jsx - VERSIÓN CORREGIDA
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOfflineCatalog } from '../hooks/useOfflineCatalog';
import { getAppMode, offlineManager } from '../utils/offlineManager';

export default function AppInitializer({ children }) {
  const [appReady, setAppReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initStep, setInitStep] = useState('Iniciando...');
  const [isOnline, setIsOnline] = useState(true);
  
  const router = useRouter();
  
  const {
    updateCatalogSilently,
    checkIfNeedsUpdate,
    getLastUpdateFormatted,
    isPWA,
    stats
  } = useOfflineCatalog();

  // ✅ MONITOREAR CONECTIVIDAD EN TIEMPO REAL
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexión restaurada');
      setIsOnline(true);
      
      // Si estamos en página offline y se restaura conexión, refrescar
      if (router.pathname === '/offline-pedidos') {
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };
    
    const handleOffline = () => {
      console.log('📴 Conexión perdida');
      setIsOnline(false);
      
      // Si tenemos catálogo y perdemos conexión, ir a offline
      if (isPWA && checkCatalogoCompleto() && router.pathname !== '/offline-pedidos' && router.pathname !== '/login') {
        setTimeout(() => {
          router.push('/offline-pedidos');
        }, 1000);
      }
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router, isPWA]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Inicializando aplicación...');
      setInitStep('Verificando entorno...');
      
      const appMode = getAppMode();
      console.log(`📱 Modo detectado: ${appMode}`);
      
      if (isPWA) {
        console.log('📱 PWA detectada - Inicializando sistema offline...');
        await initializePWA();
      } else {
        console.log('🌐 Modo Web normal');
        setAppReady(true);
        setInitializing(false);
      }
      
    } catch (error) {
      console.error('❌ Error inicializando app:', error);
      // ✅ SIEMPRE PERMITIR QUE LA APP ARRANQUE
      setAppReady(true);
      setInitializing(false);
    }
  };

  const initializePWA = async () => {
    setInitStep('Verificando catálogo offline...');
    
    // ✅ 1. VERIFICAR CATÁLOGO LOCAL
    const catalogoDisponible = checkCatalogoCompleto();
    console.log(`📦 Catálogo completo disponible: ${catalogoDisponible}`);
    
    // ✅ 2. VERIFICAR CONECTIVIDAD
    const currentlyOnline = navigator.onLine;
    console.log(`🌐 Estado de conexión: ${currentlyOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    // ✅ 3. DECIDIR FLUJO SEGÚN ESTADO
    if (!currentlyOnline && !catalogoDisponible) {
      // Sin internet y sin catálogo -> Mostrar error y esperar conexión
      setInitStep('Conexión requerida');
      setAppReady(false);
      setInitializing(false);
      return;
    }
    
    if (!currentlyOnline && catalogoDisponible) {
      // Sin internet pero con catálogo -> Ir a modo offline
      console.log('📱 Sin conexión pero con catálogo, modo offline disponible');
      setAppReady(true);
      setInitializing(false);
      
      // ✅ REDIRIGIR A OFFLINE SOLO SI NO ESTAMOS EN LOGIN
      if (router.pathname !== '/login' && router.pathname !== '/offline-pedidos') {
        setTimeout(() => {
          router.replace('/offline-pedidos');
        }, 1000);
      }
      return;
    }
    
    // ✅ 4. ONLINE: App disponible inmediatamente
    setInitStep('App lista');
    setAppReady(true);
    setInitializing(false);
    
    // ✅ 5. AUTO-ACTUALIZACIÓN SILENCIOSA EN BACKGROUND (solo si online)
    if (currentlyOnline) {
      console.log('🔄 Iniciando auto-actualización silenciosa en background...');
      setInitStep('Actualizando catálogo...');
      
      // Sin await - se ejecuta en background
      updateCatalogSilently().then(result => {
        if (result.success) {
          console.log('✅ Auto-actualización completada exitosamente');
        } else {
          console.log('⚠️ Auto-actualización falló (normal)');
        }
      }).catch(error => {
        console.log('⚠️ Auto-actualización con error (normal):', error.message);
      });
    }
  };

  // ✅ VERIFICAR SI TENEMOS CATÁLOGO COMPLETO (más permisivo)
  const checkCatalogoCompleto = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    
    // ✅ UMBRAL MÁS BAJO para considerar "completo"
    return clientes.length > 5 && productos.length > 5;
  };

  // ✅ LOADING SCREEN MEJORADO
  if (initializing || !appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          {/* Logo/Título */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">VERTIMAR</h1>
            <p className="text-blue-200">Sistema ERP</p>
          </div>

          {/* ✅ DIFERENTES ESTADOS */}
          {initStep === 'Conexión requerida' ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-6 mb-6">
              <div className="text-red-100 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Primera Conexión Requerida</h3>
              <p className="text-sm text-red-200 mb-4">
                Para usar la PWA por primera vez necesitas conexión a internet para descargar el catálogo completo.
              </p>
              
              {/* ✅ INDICADOR DE CONECTIVIDAD */}
              <div className="flex items-center justify-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {isOnline ? 'Conectado - Refrescando...' : 'Sin conexión'}
                </span>
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                disabled={!isOnline}
                className={`px-4 py-2 rounded transition-colors ${
                  isOnline 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isOnline ? 'Reintentar Ahora' : 'Esperando conexión...'}
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">{initStep}</h2>
              <p className="text-blue-200">
                {isPWA ? 'Preparando PWA...' : 'Cargando aplicación...'}
              </p>
              
              {/* ✅ INDICADOR DE CONECTIVIDAD */}
              <div className="flex items-center justify-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                <span className="text-xs text-blue-200">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          )}

          {/* ✅ INFORMACIÓN DE DEBUG EN DESARROLLO */}
          {process.env.NODE_ENV === 'development' && stats && (
            <div className="mt-6 text-xs text-blue-300 bg-blue-800 bg-opacity-50 rounded p-3">
              <p><strong>Debug PWA:</strong></p>
              <p>📱 Productos: {stats.productos} | Clientes: {stats.clientes}</p>
              <p>🕐 Última actualización: {getLastUpdateFormatted()}</p>
              <p>🌐 Online: {isOnline ? 'Sí' : 'No'}</p>
              <p>📦 Catálogo completo: {checkCatalogoCompleto() ? 'Sí' : 'No'}</p>
              <p>📍 Ruta actual: {router.pathname}</p>
            </div>
          )}

          {/* ✅ INDICADOR DE PROGRESO */}
          <div className="w-full bg-blue-700 rounded-full h-2 mt-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ 
                width: initStep === 'Conexión requerida' ? '100%' : 
                       initStep === 'App lista' ? '100%' : 
                       initStep === 'Actualizando catálogo...' ? '75%' :
                       initStep === 'Verificando catálogo offline...' ? '50%' : '25%'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAR CHILDREN CUANDO ESTÉ LISTO
  return children;
}