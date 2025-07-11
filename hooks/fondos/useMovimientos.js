// hooks/fondos/useMovimientos.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useFondos } from '../../context/FondosContext';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useMovimientos() {
  const { 
    movimientos, 
    setMovimientos, 
    filtros, 
    setFiltros, 
    resetFiltros, 
    setLoading 
  } = useFondos();

  const [formData, setFormData] = useState({
    cuenta_id: '',
    tipo: 'INGRESO',
    origen: 'ingreso manual',
    monto: 0,
    descripcion: ''
  });

  const cargarMovimientos = async (filtrosCustom = {}) => {
    setLoading({ movimientos: true });
    try {
      const filtrosAUsar = Object.keys(filtrosCustom).length > 0 ? filtrosCustom : filtros;
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      if (filtrosAUsar.cuenta_id && filtrosAUsar.cuenta_id !== 'todas') {
        params.append('cuenta_id', filtrosAUsar.cuenta_id);
      }
      if (filtrosAUsar.tipo && filtrosAUsar.tipo !== 'todos') {
        params.append('tipo', filtrosAUsar.tipo);
      }
      if (filtrosAUsar.desde) params.append('desde', filtrosAUsar.desde);
      if (filtrosAUsar.hasta) params.append('hasta', filtrosAUsar.hasta);
      if (filtrosAUsar.busqueda) params.append('busqueda', filtrosAUsar.busqueda);

      const response = await axiosAuth.get(`/finanzas/movimientos?${params.toString()}`);
      if (response.data.success) {
        setMovimientos(response.data.data);
      } else {
        toast.error("Error al cargar los movimientos");
      }
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      toast.error("No se pudieron cargar los movimientos");
    } finally {
      setLoading({ movimientos: false });
    }
  };

  const registrarMovimiento = async () => {
    if (!formData.cuenta_id) {
      toast.error("Debe seleccionar una cuenta");
      return false;
    }

    if (formData.monto <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }

    setLoading({ operacion: true });
    try {
      const response = await axiosAuth.post(`/finanzas/movimientos`, formData);
      if (response.data.success) {
        toast.success(`${formData.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado exitosamente`);
        await cargarMovimientos();
        resetForm();
        return true;
      } else {
        toast.error(response.data.message || "Error al registrar el movimiento");
        return false;
      }
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      toast.error("No se pudo registrar el movimiento");
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

  const handleFiltroChange = (name, value) => {
    setFiltros({ [name]: value });
  };

  const aplicarFiltros = () => {
    cargarMovimientos();
  };

  const limpiarFiltros = () => {
    resetFiltros();
    cargarMovimientos({
      cuenta_id: 'todas',
      tipo: 'todos',
      desde: '',
      hasta: '',
      busqueda: ''
    });
  };

  const resetForm = () => {
    setFormData({
      cuenta_id: '',
      tipo: 'INGRESO',
      origen: 'ingreso manual',
      monto: 0,
      descripcion: ''
    });
  };

  const precargarFormulario = (cuentaId, tipo) => {
    setFormData(prev => ({
      ...prev,
      cuenta_id: cuentaId,
      tipo: tipo,
      origen: tipo === 'INGRESO' ? 'ingreso manual' : 'gasto manual'
    }));
  };

  return {
    movimientos,
    formData,
    filtros,
    cargarMovimientos,
    registrarMovimiento,
    handleInputChange,
    handleFiltroChange,
    aplicarFiltros,
    limpiarFiltros,
    resetForm,
    precargarFormulario
  };
}