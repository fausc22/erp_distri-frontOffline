// hooks/egresos/useDetalleEgresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEgresos } from '../../context/EgresosContext';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useDetalleEgresos() {
  const {
    detalle,
    setDetalle,
    setModal,
    setLoading
  } = useEgresos();

  const verDetalle = async (id, tipo) => {
    try {
      if (!id) {
        toast.error("ID no válido para consultar detalles");
        return;
      }
      
      setLoading({ operacion: true });
      console.log(`Consultando detalle de ${tipo} con ID: ${id}`);
      let response;
      
      if (tipo === 'Compra') {
        response = await axiosAuth.get(`/finanzas/egresos/detalle-compra/${id}`);
        setDetalle(response.data.data, 'compra');
      } else if (tipo === 'Gasto') {
        response = await axiosAuth.get(`/finanzas/egresos/detalle-gasto/${id}`);
        setDetalle(response.data.data, 'gasto');
      } else {
        // Para egresos manuales del movimiento de fondos (tipo EGRESO)
        response = await axiosAuth.get(`/finanzas/egresos/detalle-egreso/${id}`);
        setDetalle(response.data.data, 'egreso');
      }
      
      if (response.data.success) {
        setModal('detalle', true);
      } else {
        toast.error(`Error al cargar detalle del ${tipo.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error al obtener detalle:`, error);
      toast.error(`No se pudo cargar el detalle. Error: ${error.message}`);
    } finally {
      setLoading({ operacion: false });
    }
  };

  const cerrarDetalle = () => {
    setModal('detalle', false);
    setDetalle(null, '');
  };

  const imprimirDetalle = (datos) => {
    // Implementar lógica de impresión específica
    toast.info("Funcionalidad de impresión en desarrollo");
  };

  return {
    detalle,
    verDetalle,
    cerrarDetalle,
    imprimirDetalle
  };
}