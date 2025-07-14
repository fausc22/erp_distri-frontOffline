// components/AppInitializer.jsx - VERSIÓN MEJORADA con detección offline
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOfflineCatalog } from '../hooks/useOfflineCatalog';
import { getAppMode, offlineManager } from '../utils/offlineManager';

export default function AppInitializer({ children }) {
  const [appReady, setAppReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initStep, setInitStep] = useState('Iniciando...');
  
  const router = useRouter();
  
  const {
    updateCatalogSilently,
    checkIfNeedsUpdate,
    getLastUpdateFormatted,
    isPWA,
    stats
  } = useOfflineCatalog();

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
    const isOnline = navigator.onLine;
    console.log(`🌐 Estado de conexión: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    // ✅ 3. DECIDIR FLUJO SEGÚN ESTADO
    if (!isOnline && !catalogoDisponible) {
      // Sin internet y sin catálogo -> Bloquear hasta tener conexión
      setInitStep('Esperando conexión inicial...');
      setAppReady(false);
      setInitializing(false);
      
      // Mostrar mensaje de error
      showConnectionRequiredMessage();
      return;
    }
    
    if (!isOnline && catalogoDisponible) {
      // Sin internet pero con catálogo -> Redirigir a página offline
      console.log('📱 Sin conexión pero con catálogo, redirigiendo a modo offline...');
      setAppReady(true);
      setInitializing(false);
      
      // Redirigir a página offline después de un momento
      setTimeout(() => {
        if (router.pathname !== '/offline-pedidos' && router.pathname !== '/login') {
          router.replace('/offline-pedidos');
        }
      }, 1000);
      return;
    }
    
    // ✅ 4. ONLINE: App disponible inmediatamente
    setInitStep('App lista');
    setAppReady(true);
    setInitializing(false);
    
    // ✅ 5. AUTO-ACTUALIZACIÓN SILENCIOSA EN BACKGROUND
    if (isOnline) {
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

  // ✅ VERIFICAR SI TENEMOS CATÁLOGO COMPLETO
  const checkCatalogoCompleto = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    
    // Consideramos completo si tenemos datos razonables
    return clientes.length > 0 && productos.length > 0;
  };

  // ✅ MOSTRAR MENSAJE CUANDO SE REQUIERE CONEXIÓN INICIAL
  const showConnectionRequiredMessage = () => {
    // Este estado se manejará en el loading screen
    setInitStep('Conexión requerida');
  };

  // ✅ LOADING SCREEN MEJORADO CON MEJOR UX
  if (initializing || !appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          {/* Logo/Título */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">VERTIMAR</h1>
            <p className="text-blue-200">Sistema ERP</p>
          </div>

          {/* Spinner o mensaje de error */}
          {initStep === 'Conexión requerida' ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-6 mb-6">
              <div className="text-red-100 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Conexión Inicial Requerida</h3>
              <p className="text-sm text-red-200 mb-4">
                Para usar la PWA por primera vez necesitas conexión a internet para descargar el catálogo.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">{initStep}</h2>
              <p className="text-blue-200">
                {isPWA ? 'Preparando PWA...' : 'Cargando aplicación...'}
              </p>
            </div>
          )}

          {/* ✅ INFORMACIÓN DE DEBUG EN DESARROLLO */}
          {process.env.NODE_ENV === 'development' && stats && (
            <div className="mt-6 text-xs text-blue-300 bg-blue-800 bg-opacity-50 rounded p-3">
              <p><strong>Debug PWA:</strong></p>
              <p>📱 Productos: {stats.productos} | Clientes: {stats.clientes}</p>
              <p>🕐 Última actualización: {getLastUpdateFormatted()}</p>
              <p>🌐 Online: {navigator.onLine ? 'Sí' : 'No'}</p>
              <p>📦 Catálogo completo: {checkCatalogoCompleto() ? 'Sí' : 'No'}</p>
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