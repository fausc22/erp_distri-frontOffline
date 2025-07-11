// components/AppInitializer.jsx - Inicializador de App con Auto-actualización Silenciosa
import { useEffect, useState } from 'react';
import { useOfflineCatalog } from '../hooks/useOfflineCatalog';
import { getAppMode } from '../utils/offlineManager';

export default function AppInitializer({ children }) {
  const [appReady, setAppReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
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
      
      if (isPWA) {
        console.log('📱 Modo PWA detectado');
        
        // ✅ 1. VERIFICAR SI HAY CATÁLOGO LOCAL
        checkIfNeedsUpdate();
        
        // ✅ 2. APP DISPONIBLE INMEDIATAMENTE (incluso sin catálogo)
        setAppReady(true);
        setInitializing(false);
        
        // ✅ 3. AUTO-ACTUALIZACIÓN SILENCIOSA EN BACKGROUND
        if (navigator.onLine) {
          console.log('🔄 Iniciando auto-actualización silenciosa en background...');
          
          // Sin await - se ejecuta en background
          updateCatalogSilently().then(result => {
            if (result.success) {
              console.log('✅ Auto-actualización completada exitosamente');
            } else {
              console.log('⚠️ Auto-actualización falló (normal), botón aparecerá si es necesario');
            }
          }).catch(error => {
            console.log('⚠️ Auto-actualización con error (normal):', error.message);
          });
        } else {
          console.log('📴 Sin conexión, usando catálogo offline');
        }
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

  // ✅ LOADING SCREEN MÍNIMO Y RÁPIDO
  if (initializing) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">VERTIMAR</h2>
          <p className="text-blue-200">
            {isPWA ? 'Preparando PWA...' : 'Cargando aplicación...'}
          </p>
          {/* ✅ DEBUG INFO EN DESARROLLO */}
          {process.env.NODE_ENV === 'development' && stats && (
            <div className="mt-4 text-xs text-blue-300">
              <p>📱 Catálogo: {stats.productos} productos, {stats.clientes} clientes</p>
              <p>🕐 Última actualización: {getLastUpdateFormatted()}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAR CHILDREN CUANDO ESTÉ LISTO
  return appReady ? children : null;
}