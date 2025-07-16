// utils/ConnectionManager.js - VERSIÓN FINAL: NUNCA RECARGA AUTOMÁTICAMENTE
import { toast } from 'react-hot-toast';
import { getAppMode } from './offlineManager';

class ConnectionManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.checkInterval = null;
    this.isTransitioning = false;
    this.reconnectionAttempts = 0;
    
    this.isPWA = getAppMode() === 'pwa';
    
    // Solo inicializar en cliente
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    console.log('🔌 ConnectionManager iniciado - MODO ULTRA ESTABLE (sin auto-recargas NUNCA)');
    
    // Listeners nativos del navegador
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listener para reactivación de PWA
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
    
    // ✅ DESHABILITAMOS VERIFICACIÓN PERIÓDICA AUTOMÁTICA
    // NO queremos que verifique automáticamente y cambie estados
    // Solo verificación bajo demanda
    console.log('⚠️ Verificación periódica DESHABILITADA para máxima estabilidad');
    
    // Estado inicial
    this.isOnline = navigator.onLine;
    console.log(`🌐 Estado inicial de conexión: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }

  // ✅ GESTIÓN DE EVENTOS COMPLETAMENTE SILENCIOSA
  handleOnline() {
    console.log('🌐 Evento ONLINE detectado - NOTIFICACIÓN SILENCIOSA');
    
    if (!this.isOnline) {
      this.isOnline = true;
      this.reconnectionAttempts = 0;
      this.handleConnectionRestored();
    }
  }

  handleOffline() {
    console.log('📴 Evento OFFLINE detectado - NOTIFICACIÓN SILENCIOSA');
    
    if (this.isOnline) {
      this.isOnline = false;
      this.handleConnectionLost();
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible' && this.isPWA) {
      console.log('👁️ PWA reactivada - SIN verificación automática');
      // ✅ NO HACER NADA AUTOMÁTICO
      // La verificación solo se hace bajo demanda
    }
  }

  handleFocus() {
    if (this.isPWA) {
      console.log('🔍 PWA obtuvo focus - SIN verificación automática');
      // ✅ NO HACER NADA AUTOMÁTICO
    }
  }

  // ✅ MANEJO COMPLETAMENTE SILENCIOSO - SOLO NOTIFICAR LISTENERS
  handleConnectionLost() {
    if (this.isTransitioning) return;
    
    console.log('📴 Conexión perdida - Notificación silenciosa SOLAMENTE');
    this.isTransitioning = true;
    
    // ✅ NO MOSTRAR TOAST - COMPLETAMENTE SILENCIOSO
    // Solo notificar a listeners para que actualicen UI
    this.notifyListeners('connection_lost', {
      isOnline: false,
      message: 'Conexión perdida',
      silent: true
    });
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }

  handleConnectionRestored() {
    if (this.isTransitioning) return;
    
    console.log('🌐 Conexión restaurada - Notificación silenciosa SOLAMENTE');
    this.isTransitioning = true;
    
    // ✅ NO MOSTRAR TOAST - COMPLETAMENTE SILENCIOSO
    // Solo notificar a listeners para que actualicen UI
    this.notifyListeners('connection_restored', {
      isOnline: true,
      message: 'Conexión restaurada',
      silent: true
    });
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 2000);
  }

  // ✅ VERIFICACIÓN BAJO DEMANDA - ÚNICA FORMA DE VERIFICAR CONEXIÓN
  async checkConnectionOnDemand() {
    console.log('🔍 Verificación de conexión BAJO DEMANDA...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const isOnline = response.ok;
      
      // ✅ ACTUALIZAR ESTADO INTERNO SIN NOTIFICACIONES
      const wasOnline = this.isOnline;
      this.isOnline = isOnline;
      
      console.log(`✅ Verificación bajo demanda resultado: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      // ✅ NO DISPARAR EVENTOS AUTOMÁTICOS NUNCA
      // El componente que llama esta función maneja el resultado
      
      return isOnline;
      
    } catch (error) {
      console.log('❌ Verificación bajo demanda falló:', error.message);
      this.isOnline = false;
      return false;
    }
  }

  // ✅ SISTEMA DE LISTENERS PARA UI
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, {
          isOnline: this.isOnline,
          ...data
        });
      } catch (error) {
        console.error('Error notificando listener:', error);
      }
    });
  }

  // ✅ MÉTODOS PÚBLICOS
  getConnectionState() {
    return {
      isOnline: this.isOnline,
      isTransitioning: this.isTransitioning,
      isPWA: this.isPWA
    };
  }

  // ✅ VERIFICACIÓN FORZADA MANUAL
  async forceConnectionCheck() {
    console.log('🔄 Verificación de conexión FORZADA MANUAL');
    return await this.checkConnectionOnDemand();
  }

  // ✅ NO HAY VERIFICACIÓN PERIÓDICA AUTOMÁTICA
  // Esta función ya no se usa para evitar cambios automáticos
  startPeriodicCheck() {
    console.log('⚠️ Verificación periódica NO INICIADA - Modo estable activado');
    // No hacer nada - mantener estabilidad total
  }

  destroy() {
    console.log('🧹 Destruyendo ConnectionManager');
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      window.removeEventListener('focus', this.handleFocus.bind(this));
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.listeners.clear();
  }

  waitForConnection(timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (this.isOnline) {
        resolve(true);
        return;
      }
      
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout esperando conexión'));
      }, timeout);
      
      const cleanup = this.addListener((eventType, data) => {
        if (data.isOnline) {
          clearTimeout(timeoutId);
          cleanup();
          resolve(true);
        }
      });
    });
  }

  getDebugInfo() {
    return {
      isOnline: this.isOnline,
      isTransitioning: this.isTransitioning,
      isPWA: this.isPWA,
      reconnectionAttempts: this.reconnectionAttempts,
      listenersCount: this.listeners.size,
      hasPeriodicCheck: false, // Siempre false en modo estable
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      mode: 'ULTRA_STABLE' // Nuevo modo
    };
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const connectionManager = new ConnectionManager();

// ✅ HOOK ULTRA SIMPLIFICADO - SOLO ESTADO, SIN CAMBIOS AUTOMÁTICOS
import { useState, useEffect } from 'react';

export function useConnection() {
  const [connectionState, setConnectionState] = useState(() => 
    connectionManager.getConnectionState()
  );

  useEffect(() => {
    const unsubscribe = connectionManager.addListener((eventType, data) => {
      console.log(`🔔 Listener recibió evento: ${eventType}, silent: ${data.silent}`);
      
      setConnectionState({
        isOnline: data.isOnline,
        isTransitioning: data.isTransitioning || false,
        isPWA: data.isPWA || false,
        eventType,
        eventData: data
      });
    });

    setConnectionState(connectionManager.getConnectionState());
    return unsubscribe;
  }, []);

  return {
    ...connectionState,
    forceCheck: connectionManager.forceConnectionCheck.bind(connectionManager),
    waitForConnection: connectionManager.waitForConnection.bind(connectionManager),
    checkOnDemand: connectionManager.checkConnectionOnDemand.bind(connectionManager)
  };
}