// hooks/ventas/useFiltrosVentas.js
import { useState, useMemo } from 'react';

export function useFiltrosVentas(ventasOriginales = []) {
  const [filtros, setFiltros] = useState({
    cliente: '',
    ciudad: '',
    tipoDocumento: '',
    tipoFiscal: '',
    empleado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Aplicar filtros a las ventas
  const ventasFiltradas = useMemo(() => {
    if (!ventasOriginales || ventasOriginales.length === 0) return [];

    return ventasOriginales.filter(venta => {
      // Filtro por cliente
      if (filtros.cliente && !venta.cliente_nombre?.toLowerCase().includes(filtros.cliente.toLowerCase())) {
        return false;
      }

      // Filtro por ciudad
      if (filtros.ciudad && !venta.cliente_ciudad?.toLowerCase().includes(filtros.ciudad.toLowerCase())) {
        return false;
      }

      // Filtro por tipo de documento
      if (filtros.tipoDocumento && venta.tipo_doc !== filtros.tipoDocumento) {
        return false;
      }

      // Filtro por tipo fiscal
      if (filtros.tipoFiscal && venta.tipo_f !== filtros.tipoFiscal) {
        return false;
      }

      // Filtro por empleado
      if (filtros.empleado && venta.empleado_nombre !== filtros.empleado) {
        return false;
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        const fechaVenta = new Date(venta.fecha);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaVenta < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        const fechaVenta = new Date(venta.fecha);
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59); // Incluir todo el día
        if (fechaVenta > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [ventasOriginales, filtros]);

  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      cliente: '',
      ciudad: '',
      tipoDocumento: '',
      tipoFiscal: '',
      empleado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  return {
    filtros,
    ventasFiltradas,
    handleFiltrosChange,
    limpiarFiltros
  };
}