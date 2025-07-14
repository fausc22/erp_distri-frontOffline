// hooks/pedidos/usePedidosHybrid.js - VERSIÓN MEJORADA con timeout de 8-10 segundos
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';
import { getAppMode, offlineManager } from '../../utils/offlineManager';
import { useOfflineCatalog } from '../useOfflineCatalog';

export function usePedidosHybrid() {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  const appMode = getAppMode();
  const { updateCatalogSilently } = useOfflineCatalog();

  // ✅ BUSCAR CLIENTES HÍBRIDO (Usa el nuevo sistema de catálogo completo)
  const buscarClientes = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Modo PWA: Offline first con catálogo completo
    if (appMode === 'pwa') {
      const resultadosOffline = offlineManager.buscarClientesOffline(query);
      
      if (resultadosOffline.length > 0) {
        console.log(`📱 PWA: Búsqueda offline de clientes: ${resultadosOffline.length} resultados`);
        return resultadosOffline;
      }
      
      // Si no hay resultados offline, intentar online como fallback
      if (navigator.onLine) {
        try {
          const response = await axiosAuth.get(`/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
          return response.data.success ? response.data.data : [];
        } catch (error) {
          console.error('❌ PWA: Error en búsqueda online de clientes:', error);
          return resultadosOffline; // Devolver offline aunque sea vacío
        }
      }
      
      return resultadosOffline;
    }

    // Modo Web: Online directo
    try {
      const response = await axiosAuth.get(`/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('🌐 Web: Error buscando clientes:', error);
      toast.error('Error al buscar clientes');
      return [];
    }
  };

  // ✅ BUSCAR PRODUCTOS HÍBRIDO (Usa el nuevo sistema de catálogo completo)
  const buscarProductos = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Modo PWA: Offline first con catálogo completo
    if (appMode === 'pwa') {
      const resultadosOffline = offlineManager.buscarProductosOffline(query);
      
      if (resultadosOffline.length > 0) {
        console.log(`📱 PWA: Búsqueda offline de productos: ${resultadosOffline.length} resultados`);
        return resultadosOffline;
      }
      
      // Si no hay resultados offline, intentar online como fallback
      if (navigator.onLine) {
        try {
          const response = await axiosAuth.get(`/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
          return response.data.success ? response.data.data : [];
        } catch (error) {
          console.error('❌ PWA: Error en búsqueda online de productos:', error);
          return resultadosOffline; // Devolver offline aunque sea vacío
        }
      }
      
      return resultadosOffline;
    }

    // Modo Web: Online directo
    try {
      const response = await axiosAuth.get(`/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('🌐 Web: Error buscando productos:', error);
      toast.error('Error al buscar productos');
      return [];
    }
  };

  // ✅ REGISTRAR PEDIDO HÍBRIDO CON TIMEOUT MEJORADO DE 8-10 SEGUNDOS
  const registrarPedido = async (datosFormulario) => {
    const { cliente, productos, observaciones, empleado } = datosFormulario;

    if (!cliente || !productos || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y al menos un producto');
      return { success: false };
    }

    // Calcular totales
    const subtotal = productos.reduce((acc, prod) => acc + prod.subtotal, 0);
    const totalIva = productos.reduce((acc, prod) => acc + prod.iva_calculado, 0);
    const total = subtotal + totalIva;

    // Preparar datos del pedido
    const pedidoData = {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono || '',
      cliente_direccion: cliente.direccion || '',
      cliente_ciudad: cliente.ciudad || '',
      cliente_provincia: cliente.provincia || '',
      cliente_condicion: cliente.condicion_iva || '',
      cliente_cuit: cliente.cuit || '',
      subtotal: subtotal.toFixed(2),
      iva_total: totalIva.toFixed(2),
      total: total.toFixed(2),
      estado: 'Exportado',
      empleado_id: empleado?.id || 1,
      empleado_nombre: empleado?.nombre || 'Usuario',
      observaciones: observaciones || 'sin observaciones',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida || 'Unidad',
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva_calculado),
        subtotal: parseFloat(p.subtotal)
      }))
    };

    setLoading(true);

    try {
      // ✅ MODO WEB: Directo a DB
      if (appMode === 'web') {
        console.log('🌐 Web: Registrando pedido directamente');
        
        const response = await axiosAuth.post('/pedidos/registrar-pedido', pedidoData);
        
        if (response.data.success) {
          toast.success('✅ Pedido registrado correctamente');
          
          // Actualizar catálogo en vivo si hay internet
          if (navigator.onLine) {
            try {
              await updateCatalogSilently();
            } catch (error) {
              console.log('⚠️ No se pudo actualizar catálogo después del pedido');
            }
          }
          
          return { success: true, pedidoId: response.data.pedidoId };
        } else {
          toast.error(response.data.message || 'Error al registrar pedido');
          return { success: false, error: response.data.message };
        }
      }

      // ✅ MODO PWA: Intentar online con timeout de 8-10 segundos, fallback offline
      if (appMode === 'pwa') {
        console.log('📱 PWA: Intentando registrar pedido online con timeout de 8 segundos...');
        
        if (!navigator.onLine) {
          console.log('📱 PWA: Sin conexión, guardando offline directamente');
          return await guardarPedidoOffline(pedidoData);
        }

        try {
          // ✅ TIMEOUT DE 8 SEGUNDOS COMO SOLICITASTE
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de 8 segundos')), 8000)
          );

          const registroPromise = axiosAuth.post('/pedidos/registrar-pedido', pedidoData);
          
          const response = await Promise.race([registroPromise, timeoutPromise]);
          
          if (response.data.success) {
            console.log('✅ PWA: Pedido registrado online exitosamente');
            toast.success('✅ Pedido registrado correctamente');
            
            // Actualizar catálogo en vivo
            try {
              await updateCatalogSilently();
            } catch (error) {
              console.log('⚠️ No se pudo actualizar catálogo después del pedido');
            }
            
            return { success: true, pedidoId: response.data.pedidoId };
          } else {
            throw new Error(response.data.message || 'Error del servidor');
          }
          
        } catch (error) {
          console.log(`📱 PWA: Fallo online (${error.message}), guardando offline...`);
          return await guardarPedidoOffline(pedidoData);
        }
      }

    } catch (error) {
      console.error('❌ Error inesperado registrando pedido:', error);
      
      // PWA: Intentar guardar offline como último recurso
      if (appMode === 'pwa') {
        return await guardarPedidoOffline(pedidoData);
      }
      
      toast.error('Error al registrar el pedido. Verifique su conexión.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN HELPER PARA GUARDAR OFFLINE (Mejorada)
  const guardarPedidoOffline = async (pedidoData) => {
    try {
      const tempId = await offlineManager.savePedidoPendiente(pedidoData);
      
      if (tempId) {
        // ✅ ACTUALIZAR STOCK LOCAL INMEDIATAMENTE
        for (const producto of pedidoData.productos) {
          await offlineManager.updateLocalStock(producto.id, producto.cantidad);
        }
        
        toast.success('📱 Pedido guardado offline');
        console.log(`📱 Pedido guardado offline con ID: ${tempId}, stock actualizado localmente`);
        return { 
          success: true, 
          offline: true, 
          tempId,
          message: 'Pedido guardado offline'
        };
      } else {
        toast.error('❌ Error al guardar pedido offline');
        return { 
          success: false, 
          error: 'Error guardando offline' 
        };
      }
    } catch (error) {
      console.error('❌ Error guardando pedido offline:', error);
      toast.error('❌ Error al guardar pedido offline');
      return { 
        success: false, 
        error: 'Error crítico guardando offline' 
      };
    }
  };

  // ✅ CARGAR PEDIDOS (Sin cambios, compatible con ambos modos)
  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get('/pedidos/obtener-pedidos');
      
      if (response.data.success) {
        setPedidos(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      toast.error('Error al cargar pedidos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ OBTENER DETALLE DE PEDIDO (Sin cambios)
  const obtenerDetallePedido = async (pedidoId) => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/pedidos/detalle-pedido/${pedidoId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener detalle');
      }
    } catch (error) {
      console.error('Error obteniendo detalle:', error);
      toast.error('Error al obtener detalle del pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACTUALIZAR ESTADO DE PEDIDO (Sin cambios)
  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    setLoading(true);
    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-estado/${pedidoId}`, {
        estado: nuevoEstado
      });
      
      if (response.data.success) {
        toast.success('Estado actualizado correctamente');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar estado del pedido');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ ELIMINAR PEDIDO (Sin cambios)
  const eliminarPedido = async (pedidoId) => {
    setLoading(true);
    try {
      const response = await axiosAuth.delete(`/pedidos/eliminar-pedido/${pedidoId}`);
      
      if (response.data.success) {
        toast.success('Pedido eliminado correctamente');
        await cargarPedidos();
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Error al eliminar pedido');
      }
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      toast.error('Error al eliminar pedido');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA VERIFICAR MODO ACTUAL
  const getMode = () => appMode;

  // ✅ FUNCIÓN PARA OBTENER ESTADÍSTICAS OFFLINE
  const getOfflineStats = () => {
    if (appMode === 'pwa') {
      return offlineManager.getStorageStats();
    }
    return null;
  };

  return {
    // Estados
    loading,
    pedidos,
    appMode,
    
    // ✅ FUNCIONES DE BÚSQUEDA HÍBRIDAS (MEJORADAS)
    buscarClientes,
    buscarProductos,
    
    // Funciones de pedidos híbridas
    registrarPedido,
    cargarPedidos,
    obtenerDetallePedido,
    actualizarEstadoPedido,
    eliminarPedido,
    
    // Funciones específicas PWA
    guardarPedidoOffline,
    getMode,
    getOfflineStats,
    
    // Indicadores
    isPWA: appMode === 'pwa',
    isWeb: appMode === 'web'
  };
}