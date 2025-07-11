// hooks/pedidos/useHistorialPedidos.js - VERSIÓN COMPLETA ACTUALIZADA
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export function useHistorialPedidos(filtroEmpleado = null) {
  const [pedidosOriginales, setPedidosOriginales] = useState([]); // NUEVO: Pedidos sin filtrar
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    cliente: '',
    ciudad: '',
    empleado: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  
  useEffect(() => {
    cargarPedidos();
  }, [filtroEmpleado]); // Recargar cuando cambie el filtro de empleado

  // Cargar pedidos según el rol del usuario
  const cargarPedidos = async () => {
    setLoading(true);
    try {
      let url = `/pedidos/obtener-pedidos`;
      
      // Si se especifica un filtro de empleado (para vendedores), agregarlo a la URL
      if (filtroEmpleado) {
        url += `?empleado_id=${filtroEmpleado}`;
      }
      
      const response = await axiosAuth.get(url);
      
      if (response.data.success) {
        setPedidosOriginales(response.data.data); // Guardar pedidos originales
        console.log(`📋 ${response.data.data.length} pedidos cargados`);
      } else {
        toast.error(response.data.message || 'Error al cargar pedidos');
        setPedidosOriginales([]);
      }
    } catch (error) {
      console.error("❌ Error completo al obtener pedidos:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        fullUrl: error.config?.baseURL + error.config?.url
      });
      toast.error("No se pudieron cargar los pedidos");
      setPedidosOriginales([]);
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para aplicar filtros usando useMemo
  const pedidosFiltrados = useMemo(() => {
    if (!pedidosOriginales.length) return [];

    let resultado = [...pedidosOriginales];

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(pedido => 
        pedido.estado === filtros.estado
      );
    }

    // Filtro por cliente (búsqueda parcial, insensible a mayúsculas)
    if (filtros.cliente) {
      const clienteBusqueda = filtros.cliente.toLowerCase().trim();
      resultado = resultado.filter(pedido => 
        pedido.cliente_nombre?.toLowerCase().includes(clienteBusqueda)
      );
    }

    // Filtro por ciudad (búsqueda parcial, insensible a mayúsculas)
    if (filtros.ciudad) {
      const ciudadBusqueda = filtros.ciudad.toLowerCase().trim();
      resultado = resultado.filter(pedido => 
        pedido.cliente_ciudad?.toLowerCase().includes(ciudadBusqueda)
      );
    }

    // Filtro por empleado (búsqueda exacta)
    if (filtros.empleado) {
      resultado = resultado.filter(pedido => 
        pedido.empleado_nombre === filtros.empleado
      );
    }

    // Filtro por rango de fechas
    if (filtros.fechaDesde || filtros.fechaHasta) {
      resultado = resultado.filter(pedido => {
        if (!pedido.fecha) return false;
        
        // Convertir fecha del pedido a Date
        const fechaPedido = new Date(pedido.fecha);
        const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
        const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

        // Ajustar fechaHasta para incluir todo el día
        if (fechaHasta) {
          fechaHasta.setHours(23, 59, 59, 999);
        }

        // Ajustar fechaDesde para empezar desde el inicio del día
        if (fechaDesde) {
          fechaDesde.setHours(0, 0, 0, 0);
        }

        if (fechaDesde && fechaHasta) {
          return fechaPedido >= fechaDesde && fechaPedido <= fechaHasta;
        } else if (fechaDesde) {
          return fechaPedido >= fechaDesde;
        } else if (fechaHasta) {
          return fechaPedido <= fechaHasta;
        }

        return true;
      });
    }

    console.log(`🔍 Filtros aplicados: ${resultado.length} de ${pedidosOriginales.length} pedidos`);
    return resultado;
  }, [pedidosOriginales, filtros]);

  // Seleccionar/deseleccionar un pedido individual
  const handleSelectPedido = (pedidoId) => {
    if (selectedPedidos.includes(pedidoId)) {
      setSelectedPedidos(selectedPedidos.filter(id => id !== pedidoId));
    } else {
      setSelectedPedidos([...selectedPedidos, pedidoId]);
    }
  };

  // Seleccionar/deseleccionar todos los pedidos visibles
  const handleSelectAllPedidos = (pedidosVisibles) => {
    const todosSeleccionados = pedidosVisibles.every(p => selectedPedidos.includes(p.id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      setSelectedPedidos(selectedPedidos.filter(id => !pedidosVisibles.some(p => p.id === id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      const nuevosIds = pedidosVisibles.map(p => p.id).filter(id => !selectedPedidos.includes(id));
      setSelectedPedidos([...selectedPedidos, ...nuevosIds]);
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedPedidos([]);
  };

  // Actualizar filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    // Limpiar selección cuando se cambian los filtros
    clearSelection();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      cliente: '',
      ciudad: '',
      empleado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    clearSelection();
  };

  // Cambiar estado de múltiples pedidos
  const cambiarEstadoMultiple = async (nuevoEstado) => {
    if (selectedPedidos.length === 0) {
      toast.error('No hay pedidos seleccionados');
      return false;
    }

    setLoading(true);
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const pedidoId of selectedPedidos) {
        try {
          const response = await axiosAuth.put(`/pedidos/actualizar-estado/${pedidoId}`, {
            estado: nuevoEstado
          });
          
          if (response.data.success) {
            exitosos++;
          } else {
            fallidos++;
          }
        } catch (error) {
          console.error(`Error actualizando pedido ${pedidoId}:`, error);
          fallidos++;
        }
      }

      if (exitosos > 0) {
        toast.success(`${exitosos} pedidos actualizados a "${nuevoEstado}"`);
        await cargarPedidos(); // Recargar lista
        clearSelection(); // Limpiar selección
      }
      
      if (fallidos > 0) {
        toast.error(`${fallidos} pedidos no se pudieron actualizar`);
      }

      return exitosos > 0;
    } catch (error) {
      console.error('Error en cambio masivo de estado:', error);
      toast.error('Error al cambiar estado de pedidos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar múltiples pedidos
  const eliminarMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('No hay pedidos seleccionados');
      return false;
    }

    setLoading(true);
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const pedidoId of selectedPedidos) {
        try {
          const response = await axiosAuth.delete(`/pedidos/eliminar-pedido/${pedidoId}`);
          
          if (response.data.success) {
            exitosos++;
          } else {
            fallidos++;
          }
        } catch (error) {
          console.error(`Error eliminando pedido ${pedidoId}:`, error);
          fallidos++;
        }
      }

      if (exitosos > 0) {
        toast.success(`${exitosos} pedidos eliminados`);
        await cargarPedidos(); // Recargar lista
        clearSelection(); // Limpiar selección
      }
      
      if (fallidos > 0) {
        toast.error(`${fallidos} pedidos no se pudieron eliminar`);
      }

      return exitosos > 0;
    } catch (error) {
      console.error('Error en eliminación múltiple:', error);
      toast.error('Error al eliminar pedidos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas rápidas
  const getEstadisticas = () => {
    const total = pedidosOriginales.length;
    const filtrado = pedidosFiltrados.length;
    const exportados = pedidosFiltrados.filter(p => p.estado === 'Exportado').length;
    const facturados = pedidosFiltrados.filter(p => p.estado === 'Facturado').length;
    const anulados = pedidosFiltrados.filter(p => p.estado === 'Anulado').length;
    const totalMonto = pedidosFiltrados.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    return {
      total,
      filtrado,
      exportados,
      facturados,
      anulados,
      totalMonto: parseFloat(totalMonto.toFixed(2)),
      seleccionados: selectedPedidos.length
    };
  };

  // Función para verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return Object.values(filtros).some(valor => valor && valor !== '');
  };

  return {
    // Estado principal
    pedidos: pedidosFiltrados, // Ahora devolvemos los pedidos ya filtrados
    pedidosOriginales, // NUEVO: Pedidos sin filtrar para estadísticas y empleados
    selectedPedidos,
    loading,
    filtros,
    
    // Funciones de carga
    cargarPedidos,
    
    // Funciones de selección
    handleSelectPedido,
    handleSelectAllPedidos,
    clearSelection,
    
    // Funciones de filtrado
    actualizarFiltros,
    limpiarFiltros,
    hayFiltrosActivos,
    
    // Operaciones múltiples
    cambiarEstadoMultiple,
    eliminarMultiple,
    
    // Utilidades
    getEstadisticas
  };
}