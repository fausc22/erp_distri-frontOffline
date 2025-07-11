// hooks/usePedidos.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function usePedidos() {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  // Buscar clientes
  const buscarClientes = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await axiosAuth.get(`/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error buscando clientes:', error);
      toast.error('Error al buscar clientes');
      return [];
    }
  };

  // Buscar productos
  const buscarProductos = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await axiosAuth.get(`/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error buscando productos:', error);
      toast.error('Error al buscar productos');
      return [];
    }
  };

  // Registrar nuevo pedido
  const registrarPedido = async (datosFormulario) => {
    const { cliente, productos, observaciones, empleado } = datosFormulario;

    if (!cliente || !productos || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y al menos un producto');
      return { success: false };
    }

    // Calcular totales
    const subtotal = productos.reduce((acc, prod) => acc + prod.subtotal, 0); // Sin IVA
    const totalIva = productos.reduce((acc, prod) => acc + prod.iva_calculado, 0); // IVA calculado
    const total = subtotal + totalIva; // Total con IVA

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
      subtotal: subtotal.toFixed(2), // Subtotal sin IVA
      iva_total: totalIva.toFixed(2), // Total de IVA
      total: total.toFixed(2), // Total con IVA
      estado: 'Exportado', // Según tu DB, el default es 'Exportado'
      empleado_id: empleado?.id || 1,
      empleado_nombre: empleado?.nombre || 'Usuario',
      observaciones: observaciones || 'sin observaciones',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida || 'Unidad',
        cantidad: p.cantidad,
        precio: parseFloat(p.precio), // Precio unitario
        iva: parseFloat(p.iva_calculado), // IVA en pesos
        subtotal: parseFloat(p.subtotal) // Subtotal sin IVA
      }))
    };

    setLoading(true);

    try {
      console.log('🔍 Datos del pedido a enviar:', pedidoData); // Debug para verificar estructura
      
      const response = await axiosAuth.post(`/pedidos/registrar-pedido`, pedidoData);
      
      if (response.data.success) {
        return { success: true, pedidoId: response.data.pedidoId };
      } else {
        toast.error(response.data.message || 'Error al registrar pedido');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error al registrar pedido:', error);
      toast.error('Error al registrar el pedido. Verifique su conexión.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos
  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/pedidos/obtener-pedidos`);
      
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

  // Obtener detalle de un pedido
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

  // Actualizar estado de pedido
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

  // Eliminar pedido
  const eliminarPedido = async (pedidoId) => {
    setLoading(true);
    try {
      const response = await axiosAuth.delete(`/pedidos/eliminar-pedido/${pedidoId}`);
      
      if (response.data.success) {
        toast.success('Pedido eliminado correctamente');
        // Recargar lista
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

  return {
    // Estados
    loading,
    pedidos,
    
    // Funciones de búsqueda
    buscarClientes,
    buscarProductos,
    
    // Funciones de pedidos
    registrarPedido,
    cargarPedidos,
    obtenerDetallePedido,
    actualizarEstadoPedido,
    eliminarPedido
  };
}