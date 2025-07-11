// hooks/ingresos/useNuevoIngreso.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useIngresos } from '../../context/IngresosContext';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useNuevoIngreso() {
  const { setModal, setLoading } = useIngresos();
  
  const [formData, setFormData] = useState({
    cuenta_id: '',
    monto: '',
    origen: 'ingreso manual',
    descripcion: ''
  });

  const registrarIngreso = async () => {
    // Validaciones
    if (!formData.cuenta_id) {
      toast.error("Debe seleccionar una cuenta");
      return false;
    }
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }
    
    setLoading({ operacion: true });
    try {
      const response = await axiosAuth.post(`/finanzas/ingresos/registrar`, formData);
      
      if (response.data.success) {
        toast.success("Ingreso registrado exitosamente");
        resetForm();
        setModal('nuevoIngreso', false);
        return true;
      } else {
        toast.error(response.data.message || "Error al registrar el ingreso");
        return false;
      }
    } catch (error) {
      console.error("Error al registrar ingreso:", error);
      toast.error("No se pudo registrar el ingreso");
      return false;
    } finally {
      setLoading({ operacion: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto' ? value : value
    }));
  };

  const resetForm = () => {
    setFormData({
      cuenta_id: '',
      monto: '',
      origen: 'ingreso manual',
      descripcion: ''
    });
  };

  const abrirModal = () => {
    resetForm();
    setModal('nuevoIngreso', true);
  };

  const cerrarModal = () => {
    resetForm();
    setModal('nuevoIngreso', false);
  };

  return {
    formData,
    registrarIngreso,
    handleInputChange,
    resetForm,
    abrirModal,
    cerrarModal
  };
}