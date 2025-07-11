
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useFacturacion() {
  const [loading, setLoading] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  // Cargar cuentas de fondos
  const cargarCuentasFondos = async () => {
    setLoadingCuentas(true);
    try {
      const response = await axiosAuth.get(`/finanzas/obtener-cuentas`);
      
      if (response.data.success) {
        setCuentas(response.data.data);
        return response.data.data;
      } else {
        toast.error(response.data.message || 'Error al cargar cuentas');
        return [];
      }
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      toast.error('Error al cargar cuentas de fondos');
      return [];
    } finally {
      setLoadingCuentas(false);
    }
  };

  // Facturar un pedido
  const facturarPedido = async (datosFacturacion) => {
    setLoading(true);
    try {
      console.log('🧾 Enviando datos de facturación:', datosFacturacion);
      
      const response = await axiosAuth.post(`/ventas/facturar-pedido`, datosFacturacion);
      
      if (response.data.success) {
        toast.success('¡Pedido facturado exitosamente!');
        return {
          success: true,
          data: response.data.data
        };
      } else {
        toast.error(response.data.message || 'Error al facturar pedido');
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('Error facturando pedido:', error);
      const errorMessage = error.response?.data?.message || 'Error al facturar el pedido';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Obtener movimientos de una cuenta
  const obtenerMovimientosCuenta = async (cuentaId) => {
    try {
      const response = await axiosAuth.get(`/ventas/movimientos-cuenta/${cuentaId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message || 'Error al cargar movimientos');
        return [];
      }
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      toast.error('Error al cargar movimientos de la cuenta');
      return [];
    }
  };

  return {
    // Estados
    loading,
    cuentas,
    loadingCuentas,
    
    // Funciones
    cargarCuentasFondos,
    facturarPedido,
    obtenerMovimientosCuenta
  };
}