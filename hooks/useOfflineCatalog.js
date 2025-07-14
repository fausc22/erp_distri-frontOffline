// hooks/useOfflineCatalog.js - VERSIÓN COMPLETA CORREGIDA
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { offlineManager, getAppMode } from '../utils/offlineManager';
import { axiosAuth } from '../utils/apiClient';

export function useOfflineCatalog() {
  const [loading, setLoading] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState(null);
  const [catalogVersion, setCatalogVersion] = useState(null);

  const isPWA = getAppMode() === 'pwa';

  // ✅ VERIFICAR SI NECESITA ACTUALIZACIÓN
  useEffect(() => {
    if (isPWA) {
      checkIfNeedsUpdate();
      loadStats();
      loadCatalogVersion();
    }
  }, [isPWA]);

  // ✅ AUTO-ACTUALIZACIÓN AL ABRIR APP (SOLO PWA)
  useEffect(() => {
    if (isPWA && navigator.onLine) {
      console.log('🔄 PWA detectada con internet, intentando auto-actualización...');
      updateCatalogSilently();
    }
  }, [isPWA]);

  const checkIfNeedsUpdate = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    const lastSync = offlineManager.getLastSync();
    
    // ✅ CRITERIOS MÁS ESTRICTOS PARA CATÁLOGO COMPLETO
    const needsUpdateFlag = clientes.length === 0 || 
                           productos.length === 0 || 
                           !lastSync.catalogo || 
                           (Date.now() - lastSync.catalogo) > 12 * 60 * 60 * 1000; // 12 horas
    
    setNeedsUpdate(needsUpdateFlag);
    setLastUpdate(lastSync.catalogo);
  };

  const loadStats = () => {
    const storageStats = offlineManager.getStorageStats();
    setStats(storageStats);
  };

  const loadCatalogVersion = () => {
    const version = offlineManager.getCatalogVersion();
    setCatalogVersion(version);
  };

  // ✅ NUEVA FUNCIÓN: DESCARGAR CATÁLOGO COMPLETO
  const downloadFullCatalog = async () => {
  try {
    console.log('📦 Descargando catálogo completo...');
    
    // ✅ OPCIÓN 1: Usar endpoint dedicado si existe
    try {
      const response = await axiosAuth.get('/pedidos/catalogo-completo');
      
      if (response.data.success) {
        const { clientes, productos, metadata } = response.data.data;
        
        // Guardar datos offline
        await offlineManager.saveClientes(clientes);
        await offlineManager.saveProductos(productos);
        offlineManager.setLastSync('catalogo');
        offlineManager.setCatalogVersion(metadata.version);
        
        console.log(`✅ Catálogo completo descargado: ${clientes.length} clientes, ${productos.length} productos`);
        
        setNeedsUpdate(false);
        setLastUpdate(Date.now());
        setCatalogVersion(metadata.version);
        loadStats();
        
        return {
          success: true,
          data: { clientes: clientes.length, productos: productos.length },
          metadata
        };
      }
    } catch (error) {
      console.log('⚠️ Endpoint dedicado no disponible, usando método alternativo...');
    }
    
    // ✅ OPCIÓN 2: Usar endpoints existentes con query vacía para obtener TODO
    const [clientesResponse, productosResponse] = await Promise.all([
      axiosAuth.get('/pedidos/filtrar-cliente?q='), // Query vacía = todos
      axiosAuth.get('/pedidos/filtrar-producto?q=') // Query vacía = todos
    ]);

    const clientesData = clientesResponse.data?.data || [];
    const productosData = productosResponse.data?.data || [];

    // Guardar datos offline
    await offlineManager.saveClientes(clientesData);
    await offlineManager.saveProductos(productosData);
    offlineManager.setLastSync('catalogo');
    
    // Generar versión simple basada en cantidad de datos
    const simpleVersion = `${clientesData.length}_${productosData.length}_${Date.now()}`;
    offlineManager.setCatalogVersion(simpleVersion);

    console.log(`✅ Catálogo completo descargado (método alternativo): ${clientesData.length} clientes, ${productosData.length} productos`);
    
    setNeedsUpdate(false);
    setLastUpdate(Date.now());
    setCatalogVersion(simpleVersion);
    loadStats();
    
    return {
      success: true,
      data: { clientes: clientesData.length, productos: productosData.length },
      metadata: { version: simpleVersion }
    };
    
  } catch (error) {
    console.error('❌ Error descargando catálogo completo:', error);
    throw error;
  }
  };

  // ✅ VERIFICAR SI HAY NUEVA VERSIÓN SIN DESCARGAR TODO
  const checkForUpdates = async () => {
    try {
      const currentVersion = offlineManager.getCatalogVersion();
      
      const response = await axiosAuth.get('/pedidos/verificar-version-catalogo', {
        params: { version: currentVersion }
      });
      
      if (response.data.success) {
        const { necesitaActualizacion, versionServidor } = response.data.data;
        
        if (necesitaActualizacion) {
          console.log(`🔄 Nueva versión disponible: ${versionServidor} (actual: ${currentVersion})`);
          setNeedsUpdate(true);
          return { needsUpdate: true, newVersion: versionServidor };
        } else {
          console.log('✅ Catálogo actualizado');
          setNeedsUpdate(false);
          return { needsUpdate: false };
        }
      }
      
      return { needsUpdate: false };
    } catch (error) {
      console.error('❌ Error verificando actualizaciones:', error);
      return { needsUpdate: false, error: error.message };
    }
  };

  // ✅ ACTUALIZACIÓN SILENCIOSA MEJORADA
  const updateCatalogSilently = async () => {
    try {
      console.log('🔄 Iniciando actualización silenciosa del catálogo completo...');
      
      // Timeout de 10 segundos para no bloquear
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const updatePromise = downloadFullCatalog();

      const result = await Promise.race([updatePromise, timeoutPromise]);
      
      console.log(`✅ Catálogo completo actualizado silenciosamente: ${result.data.clientes} clientes, ${result.data.productos} productos`);
      
      return { success: true, silent: true, ...result };
      
    } catch (error) {
      console.log('⚠️ Auto-actualización falló (normal):', error.message);
      setNeedsUpdate(true);
      return { success: false, silent: true, error: error.message };
    }
  };

  // ✅ ACTUALIZACIÓN MANUAL CON FEEDBACK
  const updateCatalogManual = async () => {
    if (!navigator.onLine) {
      toast.error('Sin conexión a internet');
      return { success: false, error: 'Sin conexión' };
    }

    setLoading(true);

    try {
      console.log('🔄 Iniciando actualización manual del catálogo completo...');
      
      const result = await downloadFullCatalog();
      
      toast.success(`Catálogo actualizado: ${result.data.clientes} clientes, ${result.data.productos} productos`);
      
      return result;

    } catch (error) {
      console.error('❌ Error actualizando catálogo:', error);
      toast.error('Error al actualizar catálogo');
      
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ BÚSQUEDA HÍBRIDA MEJORADA (ONLINE/OFFLINE)
  const buscarClientes = async (query) => {
    if (!query || query.trim().length < 2) return [];

    // Si es PWA, usar offline first
    if (isPWA) {
      const resultadosOffline = offlineManager.buscarClientesOffline(query);
      
      if (resultadosOffline.length > 0) {
        console.log(`📱 Búsqueda offline de clientes: ${resultadosOffline.length} resultados`);
        return resultadosOffline;
      }
      
      // Si no hay resultados offline, intentar online como fallback
      if (navigator.onLine) {
        try {
          const response = await axiosAuth.get(`/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
          return response.data?.data || [];
        } catch (error) {
          console.error('❌ Error en búsqueda online de clientes:', error);
          return resultadosOffline; // Devolver offline aunque sea vacío
        }
      }
      
      return resultadosOffline;
    }

    // Modo web normal: búsqueda online directa
    if (navigator.onLine) {
      try {
        const response = await axiosAuth.get(`/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('❌ Error en búsqueda online de clientes:', error);
        return [];
      }
    }

    return [];
  };

  const buscarProductos = async (query) => {
    if (!query || query.trim().length < 2) return [];

    // Si es PWA, usar offline first
    if (isPWA) {
      const resultadosOffline = offlineManager.buscarProductosOffline(query);
      
      if (resultadosOffline.length > 0) {
        console.log(`📱 Búsqueda offline de productos: ${resultadosOffline.length} resultados`);
        return resultadosOffline;
      }
      
      // Si no hay resultados offline, intentar online como fallback
      if (navigator.onLine) {
        try {
          const response = await axiosAuth.get(`/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
          return response.data?.data || [];
        } catch (error) {
          console.error('❌ Error en búsqueda online de productos:', error);
          return resultadosOffline;
        }
      }
      
      return resultadosOffline;
    }

    // Modo web normal: búsqueda online directa
    if (navigator.onLine) {
      try {
        const response = await axiosAuth.get(`/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('❌ Error en búsqueda online de productos:', error);
        return [];
      }
    }

    return [];
  };

  // ✅ VERIFICAR SI TENEMOS CATÁLOGO COMPLETO
  const hasCatalogComplete = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    
    // Consideramos completo si tenemos una cantidad razonable
    return clientes.length > 10 && productos.length > 10;
  };

  // ✅ LIMPIAR CATÁLOGO OFFLINE
  const clearCatalog = () => {
    offlineManager.clearOfflineData();
    setNeedsUpdate(true);
    setLastUpdate(null);
    setCatalogVersion(null);
    loadStats();
    toast.success('Catálogo offline limpiado');
  };

  // ✅ FORMATEAR ÚLTIMA ACTUALIZACIÓN
  const getLastUpdateFormatted = () => {
    if (!lastUpdate) return 'Nunca';
    
    const now = Date.now();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Hace menos de 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    if (hours < 24) return `Hace ${hours} horas`;
    return `Hace ${days} días`;
  };

  // ✅ OBTENER INFORMACIÓN DETALLADA DEL CATÁLOGO
  const getCatalogInfo = () => {
    const clientes = offlineManager.getClientes();
    const productos = offlineManager.getProductos();
    const lastSync = offlineManager.getLastSync();
    
    return {
      clientes: clientes.length,
      productos: productos.length,
      lastUpdate: lastSync.catalogo,
      version: catalogVersion,
      complete: hasCatalogComplete(),
      storage: offlineManager.calculateStorageUsage()
    };
  };

  return {
    // Estados
    loading,
    needsUpdate,
    lastUpdate,
    lastUpdateFormatted: getLastUpdateFormatted(),
    stats,
    catalogVersion,
    isPWA,

    // Funciones principales
    updateCatalogManual,
    updateCatalogSilently,
    downloadFullCatalog,
    checkForUpdates,
    buscarClientes,
    buscarProductos,
    clearCatalog,
    
    // Funciones de utilidad
    loadStats,
    checkIfNeedsUpdate,
    hasCatalogComplete,
    getCatalogInfo
  };
}

// ✅ HOOK ESPECÍFICO PARA PEDIDOS OFFLINE
export function useOfflinePedidos() {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const isPWA = getAppMode() === 'pwa';

  useEffect(() => {
    if (isPWA) {
      loadPedidosPendientes();
    }
  }, [isPWA]);

  const loadPedidosPendientes = () => {
    const pedidos = offlineManager.getPedidosPendientes();
    setPedidosPendientes(pedidos);
  };

  // ✅ GUARDAR PEDIDO OFFLINE
  const savePedidoOffline = async (pedidoData) => {
    const tempId = await offlineManager.savePedidoPendiente(pedidoData);
    
    if (tempId) {
      loadPedidosPendientes();
      toast.success('Pedido guardado offline');
      return { success: true, tempId };
    }
    
    toast.error('Error al guardar pedido offline');
    return { success: false };
  };

  // ✅ SINCRONIZAR PEDIDOS PENDIENTES
  const syncPedidosPendientes = async () => {
    if (!navigator.onLine) {
      toast.error('Sin conexión para sincronizar');
      return { success: false, error: 'Sin conexión' };
    }

    if (pedidosPendientes.length === 0) {
      toast.info('No hay pedidos pendientes');
      return { success: true, count: 0 };
    }

    setSyncing(true);
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const pedido of pedidosPendientes) {
        try {
          console.log(`🔄 Sincronizando pedido ${pedido.tempId}...`);
          
          // Remover campos temporales
          const { tempId, fechaCreacion, estado, intentos, ultimoError, ultimoIntento, ...pedidoData } = pedido;
          
          const response = await axiosAuth.post('/pedidos/registrar-pedido', pedidoData);
          
          if (response.data.success) {
            offlineManager.removePedidoPendiente(tempId);
            exitosos++;
            console.log(`✅ Pedido ${tempId} sincronizado exitosamente`);
          } else {
            offlineManager.markPedidoAsFailed(tempId, response.data.message);
            fallidos++;
          }
          
        } catch (error) {
          console.error(`❌ Error sincronizando pedido ${pedido.tempId}:`, error);
          offlineManager.markPedidoAsFailed(pedido.tempId, error.message);
          fallidos++;
        }
      }

      loadPedidosPendientes();

      if (exitosos > 0) {
        toast.success(`${exitosos} pedidos sincronizados correctamente`);
      }

      if (fallidos > 0) {
        toast.error(`${fallidos} pedidos no se pudieron sincronizar`);
      }

      return { 
        success: exitosos > 0, 
        exitosos, 
        fallidos, 
        total: pedidosPendientes.length 
      };

    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error('Error durante la sincronización');
      return { success: false, error: error.message };
    } finally {
      setSyncing(false);
    }
  };

  return {
    // Estados
    pedidosPendientes,
    syncing,
    hasPendientes: pedidosPendientes.length > 0,
    cantidadPendientes: pedidosPendientes.length,
    isPWA,

    // Funciones
    savePedidoOffline,
    syncPedidosPendientes,
    loadPedidosPendientes
  };
}