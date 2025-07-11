// hooks/remitos/useRemitos.js - Versión actualizada
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useRemitos() {
  const [remitos, setRemitos] = useState([]);
  const [selectedRemitos, setSelectedRemitos] = useState([]); // Array de IDs
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    cargarRemitos();
  }, []);

  const cargarRemitos = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/productos/obtener-remitos`);
      setRemitos(response.data);
      console.log('✅ Remitos cargados:', response.data.length);
    } catch (error) {
      console.error("Error al obtener remitos:", error);
      toast.error("No se pudieron cargar los remitos");
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección por ID
  const handleSelectRemito = (remitoId) => {
    if (selectedRemitos.includes(remitoId)) {
      setSelectedRemitos(selectedRemitos.filter(id => id !== remitoId));
    } else {
      setSelectedRemitos([...selectedRemitos, remitoId]);
    }
  };

  // Manejar selección múltiple
  const handleSelectAllRemitos = (remitosVisibles) => {
    const idsVisibles = remitosVisibles.map(r => r.id);
    const todosSeleccionados = idsVisibles.every(id => selectedRemitos.includes(id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      setSelectedRemitos(selectedRemitos.filter(id => !idsVisibles.includes(id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      const nuevosIds = idsVisibles.filter(id => !selectedRemitos.includes(id));
      setSelectedRemitos([...selectedRemitos, ...nuevosIds]);
    }
  };

  const clearSelection = () => {
    setSelectedRemitos([]);
  };

  // Obtener remitos seleccionados completos
  const getRemitosSeleccionados = () => {
    return remitos.filter(remito => selectedRemitos.includes(remito.id));
  };

  return {
    remitos,
    selectedRemitos,
    loading,
    cargarRemitos,
    handleSelectRemito,
    handleSelectAllRemitos,
    clearSelection,
    getRemitosSeleccionados
  };
}