// hooks/useOfflineCatalog.js - Gestión de Catálogo Offline
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { offlineManager, getAppMode } from '../utils/offlineManager';
import { axiosAuth } from '../utils/apiClient';

export function useOfflineCatalog() {
  const [loading, setLoading] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState(null);

  const isPWA = getAppMode() === 'pwa';

  // ✅ VERIFICAR SI NECESITA ACTUALIZACIÓN
  useEffect(() => {
    if (isPWA) {
      checkIfNeedsUpdate();
      loadStats();
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
    
    // Si no hay datos o es muy antigua (más de 24 horas)
    const needsUpdateFlag = clientes.length === 0 || 
                           productos.length === 0 || 
                           !lastSync.catalogo || 
                           (Date.now() - lastSync.catalogo) > 24 * 60 * 60 * 1000;
    
    setNeedsUpdate(needsUpdateFlag);
    setLastUpdate(lastSync.catalogo);
  };

  const loadStats = () => {
    const storageStats = offlineManager.getStorageStats();
    setStats(storageStats);
  };

  // ✅ ACTUALIZACIÓN SILENCIOSA EN BACKGROUND
  const updateCatalogSilently = async () => {
    try {
      console.log('🔄 Iniciando actualización silenciosa del catálogo...');
      
      // Timeout corto para no bloquear
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const updatePromise = Promise.all([
        axiosAuth.get('/pedidos/filtrar-cliente?q='),
        axiosAuth.get('/pedidos/filtrar-producto?q=')
      ]);

      const [clientesResponse, productosResponse] = await Promise.race([
        updatePromise,
        timeoutPromise
      ]);

      // Filtrar y limpiar datos
      const clientesData = clientesResponse.data?.data || [];
      const productosData = productosResponse.data?.data || [];

      // Guardar offline
      await offlineManager.saveClientes(clientesData);
      await offlineManager.saveProductos(productosData);
      offlineManager.setLastSync('catalogo');

      setNeedsUpdate(false);
      setLastUpdate(Date.now());
      loadStats();

      console.log(`✅ Catálogo actualizado silenciosamente: ${clientesData.length} clientes, ${productosData.length} productos`);
      
      return { success: true, silent: true };
      
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
      console.log('🔄 Iniciando actualización manual del catálogo...');
      
      // Obtener todo el catálogo
      const [clientesResponse, productosResponse] = await Promise.all([
        axiosAuth.get('/pedidos/filtrar-cliente?q='),
        axiosAuth.get('/pedidos/filtrar-producto?q=')
      ]);

      const clientesData = clientesResponse.data?.data || [];
      const productosData = productosResponse.data?.data || [];

      // Guardar offline
      await offlineManager.saveClientes(clientesData);
      await offlineManager.saveProductos(productosData);
      offlineManager.setLastSync('catalogo');

      setNeedsUpdate(false);
      setLastUpdate(Date.now());
      loadStats();

      console.log(`✅ Catálogo actualizado manualmente: ${clientesData.length} clientes, ${productosData.length} productos`);
      toast.success('Catálogo actualizado');

      return { 
        success: true, 
        data: { 
          clientes: clientesData.length, 
          productos: productosData.length 
        } 
      };

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

  // ✅ BÚSQUEDA HÍBRIDA (ONLINE/OFFLINE)
  const buscarClientes = async (query) => {
    if (!query || query.trim().length < 2) return [];

    // Si es PWA, usar offline first
    if (isPWA) {
      const resultadosOffline = offlineManager.buscarClientesOffline(query);
      
      if (resultadosOffline.length > 0) {
        console.log(`📱 Búsqueda offline de clientes: ${resultadosOffline.length} resultados`);
        return resultadosOffline;
      }
    }

    // Fallback a búsqueda online (web normal o PWA sin datos)
    if (navigator.onLine) {
      try {
        const response = await axiosAuth.get(`/pedidos/filtrar-cliente?search=${encodeURIComponent(query)}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('❌ Error en búsqueda online de clientes:', error);
        
        // Si falla online en PWA, intentar offline como último recurso
        if (isPWA) {
          return offlineManager.buscarClientesOffline(query);
        }
        
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
    }

    // Fallback a búsqueda online
    if (navigator.onLine) {
      try {
        const response = await axiosAuth.get(`/pedidos/filtrar-producto?search=${encodeURIComponent(query)}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('❌ Error en búsqueda online de productos:', error);
        
        if (isPWA) {
          return offlineManager.buscarProductosOffline(query);
        }
        
        return [];
      }
    }

    return [];
  };

  // ✅ LIMPIAR CATÁLOGO OFFLINE
  const clearCatalog = () => {
    offlineManager.clearOfflineData();
    setNeedsUpdate(true);
    setLastUpdate(null);
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

  return {
    // Estados
    loading,
    needsUpdate,
    lastUpdate,
    lastUpdateFormatted: getLastUpdateFormatted(),
    stats,
    isPWA,

    // Funciones
    updateCatalogManual,
    updateCatalogSilently,
    buscarClientes,
    buscarProductos,
    clearCatalog,
    loadStats,
    checkIfNeedsUpdate
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