// hooks/remitos/useFiltrosRemitos.js
import { useState, useMemo } from 'react';

export function useFiltrosRemitos(remitosOriginales = []) {
  const [filtros, setFiltros] = useState({
    cliente: '',
    ciudad: '',
    provincia: '',
    estado: '',
    empleado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Aplicar filtros a los remitos
  const remitosFiltrados = useMemo(() => {
    if (!remitosOriginales || remitosOriginales.length === 0) return [];

    return remitosOriginales.filter(remito => {
      // Filtro por cliente
      if (filtros.cliente && !remito.cliente_nombre?.toLowerCase().includes(filtros.cliente.toLowerCase())) {
        return false;
      }

      // Filtro por ciudad
      if (filtros.ciudad && !remito.cliente_ciudad?.toLowerCase().includes(filtros.ciudad.toLowerCase())) {
        return false;
      }

      // Filtro por provincia
      if (filtros.provincia && !remito.cliente_provincia?.toLowerCase().includes(filtros.provincia.toLowerCase())) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado && remito.estado !== filtros.estado) {
        return false;
      }

      // Filtro por empleado
      if (filtros.empleado && remito.empleado_nombre !== filtros.empleado) {
        return false;
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        const fechaRemito = new Date(remito.fecha);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaRemito < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        const fechaRemito = new Date(remito.fecha);
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59); // Incluir todo el día
        if (fechaRemito > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [remitosOriginales, filtros]);

  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      cliente: '',
      ciudad: '',
      provincia: '',
      estado: '',
      empleado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  return {
    filtros,
    remitosFiltrados,
    handleFiltrosChange,
    limpiarFiltros
  };
}