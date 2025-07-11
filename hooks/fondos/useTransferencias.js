// hooks/fondos/useTransferencias.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useFondos } from '../../context/FondosContext';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useTransferencias() {
  const { setLoading } = useFondos();
  
  const [formData, setFormData] = useState({
    cuenta_origen: '',
    cuenta_destino: '',
    monto: 0,
    descripcion: ''
  });

  const realizarTransferencia = async () => {
    if (!formData.cuenta_origen || !formData.cuenta_destino) {
      toast.error("Debe seleccionar ambas cuentas");
      return false;
    }

    if (formData.cuenta_origen === formData.cuenta_destino) {
      toast.error("Las cuentas de origen y destino deben ser diferentes");
      return false;
    }

    if (formData.monto <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }

    setLoading({ operacion: true });
    try {
      const response = await axiosAuth.post(`/finanzas/transferencias`, formData);
      if (response.data.success) {
        toast.success("Transferencia realizada exitosamente");
        resetForm();
        return true;
      } else {
        toast.error(response.data.message || "Error al realizar la transferencia");
        return false;
      }
    } catch (error) {
      console.error("Error al realizar transferencia:", error);
      toast.error("No se pudo realizar la transferencia");
      return false;
    } finally {
      setLoading({ operacion: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto' ? parseFloat(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      cuenta_origen: '',
      cuenta_destino: '',
      monto: 0,
      descripcion: ''
    });
  };

  const precargarCuentaOrigen = (cuentaId) => {
    setFormData(prev => ({
      ...prev,
      cuenta_origen: cuentaId
    }));
  };

  return {
    formData,
    realizarTransferencia,
    handleInputChange,
    resetForm,
    precargarCuentaOrigen
  };
}