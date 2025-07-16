// utils/ConnectionManager.js - SIN REDIRECCIONES AUTOMÁTICAS
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
    console.log('🔌 ConnectionManager iniciado - SIN redirecciones automáticas');
    
    // Listeners nativos del navegador
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listener para reactivación de PWA
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
    
    // Verificación periódica moderada (solo para PWA)
    if (this.isPWA) {
      this.startPeriodicCheck();
    }
    
    // Estado inicial
    this.isOnline = navigator.onLine;
    console.log(`🌐 Estado inicial de conexión: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }

  // ✅ GESTIÓN DE EVENTOS SIN REDIRECCIONES
  handleOnline() {
    console.log('🌐 Evento ONLINE detectado');
    
    if (!this.isOnline) {
      this.isOnline = true;
      this.reconnectionAttempts = 0;
      this.handleConnectionRestored();
    }
  }

  handleOffline() {
    console.log('📴 Evento OFFLINE detectado');
    
    if (this.isOnline) {
      this.isOnline = false;
      this.handleConnectionLost();
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible' && this.isPWA) {
      console.log('👁️ PWA reactivada, verificando conectividad...');
      setTimeout(() => {
        this.verifyConnection();
      }, 1000);
    }
  }

  handleFocus() {
    if (this.isPWA) {
      console.log('🔍 PWA obtuvo focus, verificando estado...');
      setTimeout(() => {
        this.verifyConnection();
      }, 500);
    }
  }

  // ✅ VERIFICACIÓN DE CONEXIÓN SIN REDIRECCIONES
  async verifyConnection() {
    const wasOnline = this.isOnline;
    let connectionWorks = false;
    
    const endpoints = [
      `${process.env.NEXT_PUBLIC_API_URL}/health`,
      'https://8.8.8.8',
    ];
    
    for (let attempt = 0; attempt < 2; attempt++) {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-cache',
            mode: endpoint.includes('8.8.8.8') ? 'no-cors' : 'cors'
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok || endpoint.includes('8.8.8.8')) {
            connectionWorks = true;
            break;
          }
          
        } catch (error) {
          console.log(`📡 Intento ${attempt + 1} falló para ${endpoint}:`, error.message);
          continue;
        }
      }
      
      if (connectionWorks) break;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.isOnline = connectionWorks;
    
    if (!wasOnline && this.isOnline) {
      this.handleConnectionRestored();
    } else if (wasOnline && !this.isOnline) {
      this.handleConnectionLost();
    }
  }

  // ✅ MANEJO SIN REDIRECCIONES - SOLO NOTIFICACIONES
  handleConnectionLost() {
    if (this.isTransitioning) return;
    
    console.log('📴 Conexión perdida - MODO OFFLINE activado');
    this.isTransitioning = true;
    
    // Solo toast informativo - SIN redirección
    toast.error('📴 Sin conexión - Modo offline activado', {
      duration: 3000,
      icon: '📱'
    });
    
    this.notifyListeners('connection_lost', {
      isOnline: false,
      message: 'Modo offline activado'
    });
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }

  handleConnectionRestored() {
    if (this.isTransitioning) return;
    
    console.log('🌐 Conexión restaurada - MODO ONLINE activado');
    this.isTransitioning = true;
    
    toast.success('🌐 Conexión restaurada - Modo online activado', {
      duration: 3000,
      icon: '🌐'
    });
    
    this.notifyListeners('connection_restored', {
      isOnline: true,
      message: 'Modo online activado'
    });
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 2000);
  }

  // ✅ VERIFICACIÓN PERIÓDICA MODERADA
  startPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.verifyConnection();
      }
    }, 45000);
    
    console.log('⏰ Verificación periódica iniciada (cada 45s)');
  }

  // ✅ SISTEMA DE LISTENERS
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

  forceConnectionCheck() {
    console.log('🔄 Verificación de conexión forzada');
    return this.verifyConnection();
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
      hasPeriodicCheck: !!this.checkInterval,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    };
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const connectionManager = new ConnectionManager();

// ✅ HOOK SIMPLIFICADO SIN REDIRECCIONES
import { useState, useEffect } from 'react';

export function useConnection() {
  const [connectionState, setConnectionState] = useState(() => 
    connectionManager.getConnectionState()
  );

  useEffect(() => {
    const unsubscribe = connectionManager.addListener((eventType, data) => {
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
    waitForConnection: connectionManager.waitForConnection.bind(connectionManager)
  };
}