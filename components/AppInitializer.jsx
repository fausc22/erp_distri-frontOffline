// components/AppInitializer.jsx - VERSIÓN MEJORADA con auto-actualización inteligente
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOfflineCatalog } from '../hooks/useOfflineCatalog';
import { getAppMode, offlineManager } from '../utils/offlineManager';
import { connectionManager } from '../utils/ConnectionManager';

export default function AppInitializer({ children }) {
  const [appReady, setAppReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initStep, setInitStep] = useState('Iniciando...');
  const [isOnline, setIsOnline] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const router = useRouter();
  
  const {
    updateCatalogSilently,
    checkIfNeedsUpdate,
    getLastUpdateFormatted,
    downloadFullCatalog,
    isPWA,
    stats
  } = useOfflineCatalog();

  // ✅ MONITOREAR CONECTIVIDAD
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };


  }, []);


  useEffect(() => {
    initializeApp();
  }, []);


  const initializeApp = async () => {
    try {
      console.log('🚀 Inicializando aplicación...');
      setInitStep('Verificando entorno...');
      setProgress(10);
      
      const appMode = getAppMode();
      console.log(`📱 Modo detectado: ${appMode}`);
      
      if (isPWA) {
        console.log('📱 PWA detectada - Inicializando sistema offline...');
        await initializePWA();
      } else {
        console.log('🌐 Modo Web normal');
        setProgress(100);
        setAppReady(true);
        setInitializing(false);
      }
      
    } catch (error) {
      console.error('❌ Error inicializando app:', error);
      // ✅ SIEMPRE PERMITIR QUE LA APP ARRANQUE
      setProgress(100);
      setAppReady(true);
      setInitializing(false);
    }
  };

  const initializePWA = async () => {
    setInitStep('Verificando catálogo offline...');
    setProgress(20);
    
    // ✅ 1. VERIFICAR CATÁLOGO LOCAL
    const catalogoDisponible = checkCatalogoCompleto();
    console.log(`📦 Catálogo completo disponible: ${catalogoDisponible}`);
    
    setProgress(30);
    
    // ✅ 2. VERIFICAR CONECTIVIDAD
    const currentlyOnline = navigator.onLine;
    console.log(`🌐 Estado de conexión: ${currentlyOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    setProgress(40);
    
    // ✅ 3. FLUJO SEGÚN ESTADO
    if (!currentlyOnline && !catalogoDisponible) {
      // Sin internet y sin catálogo -> Esperar conexión
      setInitStep('Primera conexión requerida');
      setProgress(50);
      await waitForFirstConnection();
      return;
    }
    
    if (!currentlyOnline && catalogoDisponible) {
      // Sin internet pero con catálogo -> Modo offline
      console.log('📱 Sin conexión pero con catálogo, modo offline disponible');
      setInitStep('Modo offline listo');
      setProgress(80);
      
      setAppReady(true);
      setInitializing(false);
      
      // Redirigir a offline solo si no estamos en login o ya en offline
      if (router.pathname !== '/login' && !router.pathname.includes('offline')) {
        setTimeout(() => {
          router.replace('/inicio?mode=offline');
        }, 1000);
      }
      
      setProgress(100);
      return;
    }
    
    // ✅ 4. ONLINE: Disponible inmediatamente
    setInitStep('App lista');
    setProgress(60);
    setAppReady(true);
    setInitializing(false);
    
    // ✅ 5. AUTO-ACTUALIZACIÓN INTELIGENTE EN BACKGROUND
    if (currentlyOnline) {
      await handleIntelligentUpdate();
    }
    
    setProgress(100);
  };

  // ✅ AUTO-ACTUALIZACIÓN INTELIGENTE
  const handleIntelligentUpdate = async () => {
    try {
      console.log('🧠 Iniciando auto-actualización inteligente...');
      setInitStep('Verificando actualizaciones...');
      
      const needsUpdate = checkIfNeedsUpdate();
      
      if (needsUpdate) {
        console.log('📥 Actualizaciones disponibles, descargando...');
        setInitStep('Descargando catálogo actualizado...');
        
        // Actualización silenciosa sin bloquear la UI
        updateCatalogSilently().then(result => {
          if (result.success) {
            console.log('✅ Auto-actualización completada exitosamente');
            setInitStep('Catálogo actualizado');
          } else {
            console.log('⚠️ Auto-actualización falló (continuando normalmente)');
          }
        }).catch(error => {
          console.log('⚠️ Auto-actualización con error (continuando):', error.message);
        });
      } else {
        console.log('✅ Catálogo ya está actualizado');
        setInitStep('Catálogo actualizado');
      }
      
    } catch (error) {
      console.log('⚠️ Error en auto-actualización inteligente:', error.message);
    }
  };

  // ✅ ESPERAR PRIMERA CONEXIÓN PARA PWA NUEVA
  const waitForFirstConnection = async () => {
    return new Promise((resolve) => {
      const checkConnection = async () => {
        if (navigator.onLine) {
          console.log('🌐 Primera conexión establecida, descargando catálogo...');
          setInitStep('Descargando catálogo completo...');
          setProgress(60);
          
          try {
            await downloadFullCatalog();
            setProgress(90);
            setInitStep('Catálogo descargado');
            
            setAppReady(true);
            setInitializing(false);
            setProgress(100);
            
            resolve();
          } catch (error) {
            console.error('❌ Error en primera descarga:', error);
            // Continuar de todos modos
            setAppReady(true);
            setInitializing(false);
            setProgress(100);
            resolve();
          }
        } else {
          // Seguir esperando
          setTimeout(checkConnection, 2000);
        }
      };
      
      checkConnection();
    });
  };

  // ✅ VERIFICAR SI TENEMOS CATÁLOGO COMPLETO
  const checkCatalogoCompleto = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    
    // Umbral para considerar "completo": al menos 100 clientes y 50 productos
    return clientes.length >= 100 && productos.length >= 50;
  };

  // ✅ COMPONENTE DE LOADING MEJORADO
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
          {initStep === 'Primera conexión requerida' ? (
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
                <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {isOnline ? 'Detectando conexión...' : 'Sin conexión'}
                </span>
              </div>
              
              {isOnline && (
                <div className="text-sm text-green-200">
                  ✅ Conexión detectada - Descargando catálogo...
                </div>
              )}
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

          {/* ✅ BARRA DE PROGRESO */}
          <div className="w-full bg-blue-700 rounded-full h-3 mb-4">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* ✅ INFORMACIÓN DE DEBUG EN DESARROLLO */}
          {process.env.NODE_ENV === 'development' && stats && (
            <div className="mt-6 text-xs text-blue-300 bg-blue-800 bg-opacity-50 rounded p-3">
              <p><strong>Debug PWA:</strong></p>
              <p>📱 Productos: {stats.productos} | Clientes: {stats.clientes}</p>
              <p>🕐 Última actualización: {getLastUpdateFormatted()}</p>
              <p>🌐 Online: {isOnline ? 'Sí' : 'No'}</p>
              <p>📦 Catálogo completo: {checkCatalogoCompleto() ? 'Sí' : 'No'}</p>
              <p>📍 Ruta actual: {router.pathname}</p>
              <p>🔄 Progreso: {progress}%</p>
            </div>
          )}

          {/* ✅ PASOS DE INICIALIZACIÓN */}
          <div className="text-xs text-blue-300 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded ${progress >= 20 ? 'bg-green-600' : 'bg-blue-700'}`}>
                {progress >= 20 ? '✅' : '⏳'} Verificando catálogo
              </div>
              <div className={`p-2 rounded ${progress >= 40 ? 'bg-green-600' : 'bg-blue-700'}`}>
                {progress >= 40 ? '✅' : '⏳'} Verificando conexión
              </div>
              <div className={`p-2 rounded ${progress >= 60 ? 'bg-green-600' : 'bg-blue-700'}`}>
                {progress >= 60 ? '✅' : '⏳'} Preparando app
              </div>
              <div className={`p-2 rounded ${progress >= 100 ? 'bg-green-600' : 'bg-blue-700'}`}>
                {progress >= 100 ? '✅' : '⏳'} Listo
              </div>
            </div>
          </div>

          
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAR CHILDREN CUANDO ESTÉ LISTO
  return children;
}