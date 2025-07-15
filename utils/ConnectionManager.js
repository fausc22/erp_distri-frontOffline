// utils/ConnectionManager.js - Monitor Inteligente de Conectividad para PWA
import { toast } from 'react-hot-toast';
import { getAppMode } from './offlineManager';

class ConnectionManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.checkInterval = null;
    this.isTransitioning = false;
    this.userWorkingState = null; // 'registering_order' | 'idle' | null
    this.reconnectionAttempts = 0;
    this.maxReconnectionAttempts = 3;
    
    this.isPWA = getAppMode() === 'pwa';
    
    // Solo inicializar en cliente
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    console.log('🔌 ConnectionManager iniciado para PWA');
    
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

  // ✅ VERIFICACIÓN INTELIGENTE DE CONEXIÓN
  async verifyConnection() {
    try {
      // Hacer una petición ligera al backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (!wasOnline && this.isOnline) {
        this.handleConnectionRestored();
      } else if (wasOnline && !this.isOnline) {
        this.handleConnectionLost();
      }
      
    } catch (error) {
      console.log('📡 Verificación de conexión falló:', error.message);
      
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline) {
        this.handleConnectionLost();
      }
    }
  }

  // ✅ MANEJO DE PÉRDIDA DE CONEXIÓN
  handleConnectionLost() {
    if (this.isTransitioning) return;
    
    console.log('📴 Manejando pérdida de conexión...');
    this.isTransitioning = true;
    
    const currentPath = window.location.pathname;
    const isRegisteringOrder = currentPath === '/ventas/RegistrarPedido';
    
    if (isRegisteringOrder && this.userWorkingState === 'registering_order') {
      // Usuario está registrando pedido - NO interrumpir
      console.log('📝 Usuario registrando pedido, no interrumpir');
      
      toast.error('📴 Sin conexión - Continúa en modo offline', {
        duration: 3000,
        icon: '📴'
      });
      
      // Notificar a componentes que cambien UI pero no redirijan
      this.notifyListeners('connection_lost_working', {
        isOnline: false,
        maintainState: true,
        currentPath
      });
      
    } else {
      // Usuario en otra página - Redirigir a inicio offline
      console.log('🏠 Redirigiendo a inicio offline');
      
      toast.error('📴 Sin conexión - Modo offline activado', {
        duration: 2000
      });
      
      this.notifyListeners('connection_lost_redirect', {
        isOnline: false,
        redirectTo: '/inicio?mode=offline'
      });
    }
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 2000);
  }

  // ✅ MANEJO DE RESTAURACIÓN DE CONEXIÓN
  handleConnectionRestored() {
    if (this.isTransitioning) return;
    
    console.log('🌐 Manejando restauración de conexión...');
    this.isTransitioning = true;
    
    const currentPath = window.location.pathname;
    const isRegisteringOrder = currentPath === '/ventas/RegistrarPedido';
    
    if (isRegisteringOrder && this.userWorkingState === 'registering_order') {
      // Usuario está registrando pedido - NO interrumpir
      console.log('📝 Usuario registrando pedido, no interrumpir reconexión');
      
      toast.success('🌐 Conexión restaurada - Termina tu pedido para sincronizar', {
        duration: 4000,
        icon: '🌐'
      });
      
      // Notificar cambio de UI pero no redirigir
      this.notifyListeners('connection_restored_working', {
        isOnline: true,
        maintainState: true,
        currentPath
      });
      
    } else {
      // Usuario en otra página - Recargar y ir a inicio online
      console.log('🏠 Recargando y enviando a inicio online');
      
      toast.success('🌐 Conexión restaurada', {
        duration: 2000
      });
      
      this.notifyListeners('connection_restored_redirect', {
        isOnline: true,
        redirectTo: '/inicio'
      });
    }
    
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

  // ✅ GESTIÓN DE ESTADO DEL USUARIO
  setUserWorkingState(state) {
    console.log(`👤 Estado de trabajo del usuario: ${this.userWorkingState} → ${state}`);
    this.userWorkingState = state;
  }

  getUserWorkingState() {
    return this.userWorkingState;
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
          userWorkingState: this.userWorkingState,
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
      userWorkingState: this.userWorkingState,
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
      userWorkingState: this.userWorkingState,
      isTransitioning: this.isTransitioning,
      isPWA: this.isPWA,
      reconnectionAttempts: this.reconnectionAttempts,
      listenersCount: this.listeners.size,
      hasPeriodicCheck: !!this.checkInterval
    };
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const connectionManager = new ConnectionManager();

// ✅ HOOK PARA USAR EN COMPONENTES
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
        userWorkingState: data.userWorkingState,
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
    setUserWorkingState: connectionManager.setUserWorkingState.bind(connectionManager),
    forceCheck: connectionManager.forceConnectionCheck.bind(connectionManager),
    waitForConnection: connectionManager.waitForConnection.bind(connectionManager)
  };
}