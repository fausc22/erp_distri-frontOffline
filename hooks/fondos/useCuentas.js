
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useFondos } from '../../context/FondosContext';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useCuentas() {
  const { cuentas, setCuentas, setLoading } = useFondos();
  const [formData, setFormData] = useState({ nombre: '', saldo: 0 });

  const cargarCuentas = async () => {
    setLoading({ cuentas: true });
    try {
      const response = await axiosAuth.get(`/finanzas/obtener-cuentas`);
      if (response.data.success) {
        setCuentas(response.data.data);
      } else {
        toast.error("Error al cargar las cuentas");
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
    } finally {
      setLoading({ cuentas: false });
    }
  };

  const crearCuenta = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre de la cuenta es obligatorio");
      return false;
    }

    setLoading({ operacion: true });
    try {
      const response = await axiosAuth.post(`/finanzas/cuentas`, formData);
      if (response.data.success) {
        toast.success("Cuenta creada exitosamente");
        await cargarCuentas();
        resetForm();
        return true;
      } else {
        toast.error(response.data.message || "Error al crear la cuenta");
        return false;
      }
    } catch (error) {
      console.error("Error al crear cuenta:", error);
      toast.error("No se pudo crear la cuenta");
      return false;
    } finally {
      setLoading({ operacion: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'saldo' ? parseFloat(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', saldo: 0 });
  };

  // Calcular total de saldos
  const totalSaldos = cuentas.reduce((acc, cuenta) => acc + parseFloat(cuenta.saldo), 0);

  return {
    cuentas,
    formData,
    totalSaldos,
    cargarCuentas,
    crearCuenta,
    handleInputChange,
    resetForm
  };
}