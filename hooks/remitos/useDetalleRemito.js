// hooks/remitos/useDetalleRemito.js - Versión actualizada
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useDetalleRemito() {
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarProductosRemito = async (remito) => {
    setSelectedRemito(remito);
    setLoading(true);

    try {
      const response = await axiosAuth.get(`/productos/obtener-productos-remito/${remito.id}`);
      setProductos(response.data);
      console.log('📦 Productos del remito cargados:', response.data.length);
    } catch (error) {
      console.error("Error al obtener productos del remito:", error);
      toast.error("No se pudieron cargar los productos del remito");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const cerrarDetalle = () => {
    setSelectedRemito(null);
    setProductos([]);
  };

  return {
    selectedRemito,
    productos,
    loading,
    cargarProductosRemito,
    cerrarDetalle
  };
}