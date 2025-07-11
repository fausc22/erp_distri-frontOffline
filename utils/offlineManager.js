// utils/offlineManager.js - Sistema de Storage Offline para PWA
import { toast } from 'react-hot-toast';

// ✅ HELPER PARA SSR
const isClient = () => typeof window !== 'undefined';

// ✅ DETECCIÓN DE ENTORNO
export const getAppMode = () => {
  if (!isClient()) return 'ssr';
  
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone ||
                document.referrer.includes('android-app://');
  
  return isPWA ? 'pwa' : 'web';
};

// ✅ CONFIGURACIÓN DE STORAGE
const STORAGE_KEYS = {
  CLIENTES: 'vertimar_clientes_offline',
  PRODUCTOS: 'vertimar_productos_offline',
  PEDIDOS_PENDIENTES: 'vertimar_pedidos_pendientes',
  LAST_SYNC: 'vertimar_last_sync',
  CATALOG_VERSION: 'vertimar_catalog_version'
};

class OfflineManager {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo
  }

  // ✅ DETECCIÓN DE CONECTIVIDAD
  isOnline() {
    return navigator.onLine;
  }

  // ✅ STORAGE DE CLIENTES
  async saveClientes(clientes) {
    try {
      if (!isClient()) return false;
      
      const data = {
        clientes,
        timestamp: Date.now(),
        version: this.generateVersion()
      };
      
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(data));
      console.log(`📱 ${clientes.length} clientes guardados offline`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando clientes offline:', error);
      return false;
    }
  }

  getClientes() {
    try {
      if (!isClient()) return [];
      
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.clientes || [];
    } catch (error) {
      console.error('❌ Error obteniendo clientes offline:', error);
      return [];
    }
  }

  // ✅ STORAGE DE PRODUCTOS
  async saveProductos(productos) {
    try {
      if (!isClient()) return false;
      
      const data = {
        productos,
        timestamp: Date.now(),
        version: this.generateVersion()
      };
      
      localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(data));
      console.log(`📱 ${productos.length} productos guardados offline`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando productos offline:', error);
      return false;
    }
  }

  getProductos() {
    try {
      if (!isClient()) return [];
      
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.productos || [];
    } catch (error) {
      console.error('❌ Error obteniendo productos offline:', error);
      return [];
    }
  }

  // ✅ BÚSQUEDA OFFLINE DE CLIENTES
  buscarClientesOffline(query) {
    const clientes = this.getClientes();
    if (!query || query.trim().length < 2) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(searchTerm) ||
      cliente.ciudad?.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
  }

  // ✅ BÚSQUEDA OFFLINE DE PRODUCTOS
  buscarProductosOffline(query) {
    const productos = this.getProductos();
    if (!query || query.trim().length < 2) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return productos.filter(producto => 
      producto.nombre?.toLowerCase().includes(searchTerm) ||
      producto.id?.toString().includes(searchTerm)
    ).slice(0, 10);
  }

  // ✅ STORAGE DE PEDIDOS PENDIENTES
  async savePedidoPendiente(pedidoData) {
    try {
      if (!isClient()) return false;
      
      const pedidosPendientes = this.getPedidosPendientes();
      
      // Generar ID temporal único
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const pedidoPendiente = {
        ...pedidoData,
        tempId,
        fechaCreacion: new Date().toISOString(),
        estado: 'pendiente_sincronizacion',
        intentos: 0
      };
      
      pedidosPendientes.push(pedidoPendiente);
      localStorage.setItem(STORAGE_KEYS.PEDIDOS_PENDIENTES, JSON.stringify(pedidosPendientes));
      
      console.log(`📱 Pedido guardado offline con ID temporal: ${tempId}`);
      return tempId;
    } catch (error) {
      console.error('❌ Error guardando pedido pendiente:', error);
      return false;
    }
  }

  getPedidosPendientes() {
    try {
      if (!isClient()) return [];
      
      const data = localStorage.getItem(STORAGE_KEYS.PEDIDOS_PENDIENTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error obteniendo pedidos pendientes:', error);
      return [];
    }
  }

  // ✅ REMOVER PEDIDO PENDIENTE DESPUÉS DE SINCRONIZAR
  removePedidoPendiente(tempId) {
    try {
      if (!isClient()) return false;
      
      const pedidosPendientes = this.getPedidosPendientes();
      const pedidosActualizados = pedidosPendientes.filter(p => p.tempId !== tempId);
      
      localStorage.setItem(STORAGE_KEYS.PEDIDOS_PENDIENTES, JSON.stringify(pedidosActualizados));
      console.log(`✅ Pedido pendiente removido: ${tempId}`);
      return true;
    } catch (error) {
      console.error('❌ Error removiendo pedido pendiente:', error);
      return false;
    }
  }

  // ✅ MARCAR PEDIDO COMO FALLIDO
  markPedidoAsFailed(tempId, error) {
    try {
      if (!isClient()) return false;
      
      const pedidosPendientes = this.getPedidosPendientes();
      const pedidoIndex = pedidosPendientes.findIndex(p => p.tempId === tempId);
      
      if (pedidoIndex !== -1) {
        pedidosPendientes[pedidoIndex].intentos = (pedidosPendientes[pedidoIndex].intentos || 0) + 1;
        pedidosPendientes[pedidoIndex].ultimoError = error;
        pedidosPendientes[pedidoIndex].ultimoIntento = new Date().toISOString();
        
        localStorage.setItem(STORAGE_KEYS.PEDIDOS_PENDIENTES, JSON.stringify(pedidosPendientes));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error marcando pedido como fallido:', error);
      return false;
    }
  }

  // ✅ METADATA DE SINCRONIZACIÓN
  setLastSync(tipo, timestamp = Date.now()) {
    try {
      if (!isClient()) return false;
      
      const syncData = this.getLastSync();
      syncData[tipo] = timestamp;
      
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(syncData));
      return true;
    } catch (error) {
      console.error('❌ Error guardando última sincronización:', error);
      return false;
    }
  }

  getLastSync() {
    try {
      if (!isClient()) return {};
      
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error obteniendo última sincronización:', error);
      return {};
    }
  }

  // ✅ VERSIONING PARA CACHE INVALIDATION
  generateVersion() {
    return Date.now().toString();
  }

  getCatalogVersion() {
    try {
      if (!isClient()) return null;
      return localStorage.getItem(STORAGE_KEYS.CATALOG_VERSION);
    } catch (error) {
      return null;
    }
  }

  setCatalogVersion(version) {
    try {
      if (!isClient()) return false;
      localStorage.setItem(STORAGE_KEYS.CATALOG_VERSION, version);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ✅ LIMPIAR STORAGE OFFLINE
  clearOfflineData() {
    try {
      if (!isClient()) return false;
      
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Datos offline limpiados');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando datos offline:', error);
      return false;
    }
  }

  // ✅ ESTADÍSTICAS DE STORAGE
  getStorageStats() {
    try {
      if (!isClient()) return null;
      
      const clientes = this.getClientes();
      const productos = this.getProductos();
      const pedidosPendientes = this.getPedidosPendientes();
      const lastSync = this.getLastSync();
      
      return {
        clientes: clientes.length,
        productos: productos.length,
        pedidosPendientes: pedidosPendientes.length,
        lastSync,
        catalogVersion: this.getCatalogVersion(),
        storageUsed: this.calculateStorageUsage()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }

  calculateStorageUsage() {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      });
      
      return {
        bytes: totalSize,
        mb: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      return { bytes: 0, mb: '0.00' };
    }
  }

  // ✅ TIMEOUT HELPER
  async withTimeout(promise, timeout = 10000) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const offlineManager = new OfflineManager();

// ✅ HOOKS PARA COMPONENTES
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    setIsPWA(getAppMode() === 'pwa');
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, isPWA, appMode: getAppMode() };
};