// utils/ConnectionManager.js - Monitor Simplificado para Redirección a Página Offline
import { toast } from 'react-hot-toast';
import { getAppMode } from './offlineManager';

class ConnectionManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.checkInterval = null;
    this.isTransitioning = false;
    this.reconnectionAttempts = 0;
    this.maxReconnectionAttempts = 3;
    
    this.isPWA = getAppMode() === 'pwa';
    
    // Solo inicializar en cliente
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    console.log('🔌 ConnectionManager iniciado para redirección a página offline');
    
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

  // ✅ GESTIÓN DE EVENTOS DE CONECTIVIDAD
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

  // ✅ MANEJO DE REACTIVACIÓN DE PWA
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

  // ✅ VERIFICACIÓN INTELIGENTE DE CONEXIÓN ROBUSTA
  async verifyConnection() {
    const wasOnline = this.isOnline;
    let connectionWorks = false;
    
    // ✅ MÚLTIPLES INTENTOS CON DIFERENTES ENDPOINTS
    const endpoints = [
      `${process.env.NEXT_PUBLIC_API_URL}/health`,
      'https://8.8.8.8', // Google DNS como fallback
    ];
    
    for (let attempt = 0; attempt < 2; attempt++) {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
          
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
      
      // Esperar 2 segundos antes del siguiente intento
      if (attempt < 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.isOnline = connectionWorks;
    
    // Solo cambiar estado si realmente cambió
    if (!wasOnline && this.isOnline) {
      this.handleConnectionRestored();
    } else if (wasOnline && !this.isOnline) {
      this.handleConnectionLost();
    }
  }

  // ✅ MANEJO DE PÉRDIDA DE CONEXIÓN - SIMPLIFICADO
  handleConnectionLost() {
    if (this.isTransitioning) return;
    
    console.log('📴 Manejando pérdida de conexión...');
    this.isTransitioning = true;
    
    const currentPath = window.location.pathname;
    
    // ✅ SI YA ESTÁ EN LA PÁGINA OFFLINE, NO HACER NADA
    if (currentPath === '/offline') {
      console.log('📱 Ya está en página offline, no redirigir');
      this.notifyListeners('connection_lost_already_offline', {
        isOnline: false,
        currentPath
      });
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 1000);
      return;
    }
    
    // ✅ REDIRIGIR A PÁGINA OFFLINE SIEMPRE
    console.log('🏠 Redirigiendo a página offline dedicada');
    
    toast.error('📴 Sin conexión - Modo offline activado', {
      duration: 2000
    });
    
    // Notificar antes de redirigir
    this.notifyListeners('connection_lost_redirect', {
      isOnline: false,
      redirectTo: '/offline'
    });
    
    // ✅ REDIRECCIÓN INMEDIATA Y ROBUSTA
    setTimeout(() => {
      window.location.href = '/offline';
    }, 500);
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 2000);
  }

  // ✅ MANEJO DE RESTAURACIÓN DE CONEXIÓN - SIMPLIFICADO
  handleConnectionRestored() {
    if (this.isTransitioning) return;
    
    console.log('🌐 Manejando restauración de conexión...');
    this.isTransitioning = true;
    
    const currentPath = window.location.pathname;
    
    // ✅ SI ESTÁ EN PÁGINA OFFLINE, SOLO NOTIFICAR (NO REDIRIGIR)
    if (currentPath === '/offline') {
      console.log('📱 En página offline, mostrando botón de reconexión');
      
      // NO mostrar toast aquí - lo maneja la página offline
      
      // Notificar a la página offline para mostrar botón
      this.notifyListeners('connection_restored_show_button', {
        isOnline: true,
        currentPath
      });
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 1000);
      return;
    }
    
    // ✅ SI ESTÁ EN CUALQUIER OTRA PÁGINA, NOTIFICAR NORMALMENTE
    console.log('🌐 En página online, notificando restauración');
    
    toast.success('🌐 Conexión restaurada', {
      duration: 2000
    });
    
    this.notifyListeners('connection_restored_normal', {
      isOnline: true,
      currentPath
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
    
    // Verificar cada 45 segundos (no muy agresivo)
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
    
    return () => {
      this.listeners.delete(callback);
    };
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

  // ✅ CLEANUP
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

  // ✅ MÉTODOS DE UTILIDAD
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

  // ✅ INFORMACIÓN DE DEBUG
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

// ✅ HOOK PARA USAR EN COMPONENTES - SIMPLIFICADO
import { useState, useEffect } from 'react';

export function useConnection() {
  const [connectionState, setConnectionState] = useState(() => 
    connectionManager.getConnectionState()
  );

  useEffect(() => {
    // Listener para cambios de conectividad
    const unsubscribe = connectionManager.addListener((eventType, data) => {
      setConnectionState({
        isOnline: data.isOnline,
        isTransitioning: data.isTransitioning || false,
        isPWA: data.isPWA || false,
        eventType,
        eventData: data
      });
    });

    // Estado inicial
    setConnectionState(connectionManager.getConnectionState());

    return unsubscribe;
  }, []);

  return {
    ...connectionState,
    forceCheck: connectionManager.forceConnectionCheck.bind(connectionManager),
    waitForConnection: connectionManager.waitForConnection.bind(connectionManager)
  };
}