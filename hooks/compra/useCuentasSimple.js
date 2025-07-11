import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';

export function useCuentasSimple() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  const cargarCuentas = async () => {
    setLoadingCuentas(true);
    try {
      const response = await axiosAuth.get(`/finanzas/obtener-cuentas`);
      if (response.data.success) {
        setCuentas(response.data.data);
        return response.data.data;
      } else {
        toast.error("Error al cargar las cuentas");
        return [];
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
      return [];
    } finally {
      setLoadingCuentas(false);
    }
  };

  const obtenerCuenta = async (cuentaId) => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/finanzas/cuentas/${cuentaId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error('Error al obtener la cuenta');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      toast.error('Error al obtener la cuenta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const crearCuenta = async (datosNuevaCuenta) => {
    setLoading(true);
    try {
      const response = await axiosAuth.post('/finanzas/cuentas', datosNuevaCuenta);
      
      if (response.data.success) {
        toast.success('Cuenta creada exitosamente');
        await cargarCuentas(); // Recargar la lista
        return true;
      } else {
        toast.error(response.data.message || 'Error al crear la cuenta');
        return false;
      }
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      toast.error('Error al crear la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de saldos
  const totalSaldos = cuentas.reduce((acc, cuenta) => acc + parseFloat(cuenta.saldo), 0);

  return {
    cuentas,
    loading,
    loadingCuentas,
    totalSaldos,
    cargarCuentas,
    obtenerCuenta,
    crearCuenta
  };
}